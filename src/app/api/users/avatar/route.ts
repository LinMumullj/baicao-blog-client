import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const { avatarUrl } = body;

    if (!avatarUrl || typeof avatarUrl !== "string") {
      return NextResponse.json({ error: "头像地址无效" }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { avatar: avatarUrl },
      select: { id: true, username: true, avatar: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "更新头像失败" },
      { status: 500 }
    );
  }
}
