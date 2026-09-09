export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export function getMaxUploadBytes(contentType: string): number {
  return contentType.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
}

export function validateUploadFileSize(file: {
  size: number;
  type: string;
}): string | null {
  const maxBytes = getMaxUploadBytes(file.type);
  if (file.size <= maxBytes) return null;

  const maxMB = maxBytes / (1024 * 1024);
  const kind = file.type.startsWith("video/") ? "视频" : "图片";
  return `${kind}大小不能超过 ${maxMB}MB`;
}
