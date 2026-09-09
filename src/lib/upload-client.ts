export type UploadedMedia = { url: string; type: string };

async function parseUploadError(res: Response): Promise<string> {
  if (res.status === 413) {
    return "上传内容过大，请压缩图片后重试";
  }

  try {
    const data = (await res.json()) as { error?: string };
    return data.error || "上传失败";
  } catch {
    return "上传失败";
  }
}

/** 逐张上传，避免多张图一次性提交超过 Nginx 请求体上限（50MB） */
export async function uploadFilesSequentially(
  files: File[],
): Promise<UploadedMedia[]> {
  const uploads: UploadedMedia[] = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("files", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(await parseUploadError(res));
    }

    const data = (await res.json()) as { uploads: UploadedMedia[] };
    uploads.push(...data.uploads);
  }

  return uploads;
}
