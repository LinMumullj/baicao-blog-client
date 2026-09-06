import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFileToOSS } from "@/lib/oss";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files").filter(
      (item): item is File => item instanceof File
    );

    if (files.length === 0) {
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

    const uploads = await Promise.all(
      files.map(async (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
          throw new Error(`不支持的文件类型: ${file.type}`);
        }

        const result = await uploadFileToOSS(file, file.name, file.type);
        return {
          url: result.url,
          type: file.type.startsWith("video/") ? "video" : "image",
        };
      })
    );

    return NextResponse.json({ uploads });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "上传失败";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
