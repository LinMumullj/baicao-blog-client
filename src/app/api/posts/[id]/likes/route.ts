import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const PAGE_SIZE = 20;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id: postId } = await context.params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || String(PAGE_SIZE)),
      50
    );

    const post = await db.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "动态不存在" }, { status: 404 });
    }

    const likes = await db.like.findMany({
      where: { postId },
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, username: true, avatar: true },
        },
      },
    });

    let nextCursor: string | null = null;
    if (likes.length > limit) {
      const nextItem = likes.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      likers: likes.map((like) => ({
        id: like.user.id,
        username: like.user.username,
        avatar: like.user.avatar,
      })),
      nextCursor,
    });
  } catch {
    return NextResponse.json(
      { error: "获取点赞者失败" },
      { status: 500 }
    );
  }
}
