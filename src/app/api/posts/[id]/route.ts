import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteOssObjectsByUrls } from "@/lib/oss";
import { canModifyPost, isAdminRole } from "@/lib/post-access";
import {
  mediaTypeFromUrls,
  validateMediaUrls,
  type MediaUrlInput,
} from "@/lib/post-media";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        media: { orderBy: { order: "asc" } },
        postTags: { include: { tag: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch {
    return NextResponse.json(
      { error: "获取动态详情失败" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.post.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    }

    if (!isAdminRole(session.user.role)) {
      return NextResponse.json({ error: "仅管理员可编辑动态" }, { status: 403 });
    }

    const body = await request.json();
    const { content, title, isLongPost, tags, mediaUrls } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }

    const hasMediaUpdate = Array.isArray(mediaUrls);
    let mediaList: MediaUrlInput[] = [];
    let removedUrls: string[] = [];

    if (hasMediaUpdate) {
      mediaList = mediaUrls as MediaUrlInput[];
      const mediaError = validateMediaUrls(mediaList);
      if (mediaError) {
        return NextResponse.json({ error: mediaError }, { status: 400 });
      }

      const nextUrls = new Set(mediaList.map((item) => item.url));
      removedUrls = existing.media
        .map((item) => item.url)
        .filter((url) => !nextUrls.has(url));
    }

    const updated = await db.$transaction(async (tx) => {
      const post = await tx.post.update({
        where: { id },
        data: {
          content: content.trim(),
          title: isLongPost && title ? title.trim() : null,
          isLongPost: !!isLongPost,
          ...(hasMediaUpdate
            ? { mediaType: mediaTypeFromUrls(mediaList) }
            : {}),
        },
      });

      if (hasMediaUpdate) {
        await tx.media.deleteMany({ where: { postId: id } });
        if (mediaList.length > 0) {
          await tx.media.createMany({
            data: mediaList.map((item, index) => ({
              url: item.url,
              type: item.type,
              order: index,
              postId: id,
            })),
          });
        }
      }

      if (Array.isArray(tags)) {
        await tx.postTag.deleteMany({ where: { postId: id } });
        if (tags.length > 0) {
          for (const tagName of tags as string[]) {
            const tag = await tx.tag.upsert({
              where: { name: tagName },
              create: { name: tagName },
              update: {},
            });
            await tx.postTag.create({
              data: { postId: id, tagId: tag.id },
            });
          }
        }
      }

      return post;
    });

    if (removedUrls.length > 0) {
    try {
      await deleteOssObjectsByUrls(removedUrls);
    } catch (error) {
      console.error("OSS cleanup failed after post update:", error);
    }
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "更新失败，请稍后重试" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.post.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!existing) {
      return NextResponse.json({ success: true });
    }

    if (!canModifyPost(session.user, existing)) {
      return NextResponse.json({ error: "无权删除此动态" }, { status: 403 });
    }

    const mediaUrls = existing.media.map((item) => item.url);

    await db.post.delete({ where: { id } });

    try {
      await deleteOssObjectsByUrls(mediaUrls);
    } catch (error) {
      console.error("OSS cleanup failed after post delete:", error);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "删除失败，请稍后重试" },
      { status: 500 }
    );
  }
}
