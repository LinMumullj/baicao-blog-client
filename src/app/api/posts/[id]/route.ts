import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
