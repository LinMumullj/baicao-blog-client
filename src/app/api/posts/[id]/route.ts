import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function isAdminRole(role?: string) {
  return role === "ADMIN";
}

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

    if (!isAdminRole(session.user.role)) {
      return NextResponse.json({ error: "仅管理员可编辑动态" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.post.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    }

    const body = await request.json();
    const { content, title, isLongPost, tags } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }

    const updated = await db.$transaction(async (tx) => {
      const post = await tx.post.update({
        where: { id },
        data: {
          content: content.trim(),
          title: isLongPost && title ? title.trim() : null,
          isLongPost: !!isLongPost,
        },
      });

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

    if (!isAdminRole(session.user.role)) {
      return NextResponse.json({ error: "仅管理员可删除动态" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await db.post.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    }

    await db.post.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "删除失败，请稍后重试" },
      { status: 500 }
    );
  }
}
