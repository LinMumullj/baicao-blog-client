import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateUploadParams } from "@/lib/oss";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const body = await request.json();
    const { files } = body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "请选择要上传的文件" },
        { status: 400 }
      );
    }

    if (files.length > 9) {
      return NextResponse.json(
        { error: "最多上传 9 个文件" },
        { status: 400 }
      );
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const allowedVideoTypes = [
      "video/mp4",
      "video/quicktime",
      "video/webm",
    ];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    const uploadParams = files.map(
      (file: { name: string; type: string }) => {
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`不支持的文件类型: ${file.type}`);
        }
        return generateUploadParams(file.name, file.type);
      }
    );

    return NextResponse.json({ uploads: uploadParams });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "上传参数生成失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
