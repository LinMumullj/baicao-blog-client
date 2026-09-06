import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const PAGE_SIZE = 10;

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    if ((session.user as { role: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "仅管理员可发布动态" }, { status: 403 });
    }

    const body = await request.json();
    const { content, title, isLongPost, mediaUrls, tags } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }

    const mediaList = mediaUrls || [];

    if (mediaList.length > 9) {
      return NextResponse.json(
        { error: "最多上传 9 张图片" },
        { status: 400 }
      );
    }

    let mediaType: "IMAGE" | "VIDEO" | "NONE" = "NONE";
    if (mediaList.length > 0) {
      const hasVideo = mediaList.some(
        (m: { type: string }) => m.type === "video"
      );
      const hasImage = mediaList.some(
        (m: { type: string }) => m.type === "image"
      );
      if (hasVideo && hasImage) {
        return NextResponse.json(
          { error: "图片和视频不能同时上传" },
          { status: 400 }
        );
      }
      mediaType = hasVideo ? "VIDEO" : "IMAGE";
    }

    const post = await db.$transaction(async (tx) => {
      const newPost = await tx.post.create({
        data: {
          content: content.trim(),
          title: isLongPost && title ? title.trim() : null,
          isLongPost: !!isLongPost,
          mediaType,
          authorId: session.user!.id,
          ...(tags && tags.length > 0
            ? {
                postTags: {
                  create: tags.map((tagName: string) => ({
                    tag: {
                      connectOrCreate: {
                        where: { name: tagName },
                        create: { name: tagName },
                      },
                    },
                  })),
                },
              }
            : {}),
        },
      });

      if (mediaList.length > 0) {
        await tx.media.createMany({
          data: mediaList.map(
            (m: { url: string; type: string }, index: number) => ({
              url: m.url,
              type: m.type,
              order: index,
              postId: newPost.id,
            })
          ),
        });
      }

      return newPost;
    });

    return NextResponse.json({ id: post.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "发布失败，请稍后重试" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(PAGE_SIZE)),
      50
    );
    const tag = searchParams.get("tag");

    const where = tag
      ? { postTags: { some: { tag: { name: tag } } } }
      : {};

    const posts = await db.post.findMany({
      where,
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        media: { orderBy: { order: "asc" } },
        postTags: { include: { tag: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    let nextCursor: string | null = null;
    if (posts.length > limit) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      posts,
      nextCursor,
    });
  } catch {
    return NextResponse.json(
      { error: "获取动态列表失败" },
      { status: 500 }
    );
  }
}
