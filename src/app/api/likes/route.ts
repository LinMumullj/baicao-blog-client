import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const userId = session.user.id!;
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: "缺少 postId" }, { status: 400 });
    }

    const existing = await db.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await db.like.delete({
        where: { userId_postId: { userId, postId } },
      });
    } else {
      await db.like.create({
        data: { userId, postId },
      });
    }

    const likeCount = await db.like.count({ where: { postId } });

    return NextResponse.json({
      liked: !existing,
      likeCount,
    });
  } catch {
    return NextResponse.json(
      { error: "操作失败，请稍后重试" },
      { status: 500 }
    );
  }
}
