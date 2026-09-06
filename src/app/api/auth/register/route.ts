import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, inviteCode } = body;

    if (!username || !password || !inviteCode) {
      return NextResponse.json(
        { error: "用户名、密码和邀请码不能为空" },
        { status: 400 }
      );
    }

    if (username.length < 2 || username.length > 20) {
      return NextResponse.json(
        { error: "用户名长度需在 2-20 个字符之间" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码至少需要 6 个字符" },
        { status: 400 }
      );
    }

    const expectedInviteCode = process.env.INVITE_CODE;
    if (inviteCode !== expectedInviteCode) {
      return NextResponse.json(
        { error: "邀请码无效" },
        { status: 403 }
      );
    }

    const existingUser = await db.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "用户名已被占用" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        role: "MEMBER",
      },
    });

    return NextResponse.json(
      { id: user.id, username: user.username, role: user.role },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
