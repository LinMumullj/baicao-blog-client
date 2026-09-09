import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const authors = await db.user.findMany({
      where: {
        role: "ADMIN",
        posts: { some: {} },
      },
      select: {
        username: true,
        avatar: true,
        _count: { select: { posts: true } },
      },
      orderBy: { username: "asc" },
    });

    return NextResponse.json(
      authors.map((author) => ({
        username: author.username,
        avatar: author.avatar,
        postCount: author._count.posts,
      }))
    );
  } catch {
    return NextResponse.json(
      { error: "获取作者列表失败" },
      { status: 500 }
    );
  }
}
