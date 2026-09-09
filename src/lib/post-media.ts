export type MediaUrlInput = { url: string; type: string };

export function validateMediaUrls(mediaList: MediaUrlInput[]): string | null {
  if (mediaList.length > 9) {
    return "最多上传 9 张图片";
  }

  if (mediaList.length === 0) {
    return null;
  }

  const hasVideo = mediaList.some((item) => item.type === "video");
  const hasImage = mediaList.some((item) => item.type === "image");

  if (hasVideo && hasImage) {
    return "图片和视频不能同时上传";
  }

  if (hasVideo && mediaList.length > 1) {
    return "最多上传 1 个视频";
  }

  return null;
}

export function mediaTypeFromUrls(
  mediaList: MediaUrlInput[]
): "IMAGE" | "VIDEO" | "NONE" {
  if (mediaList.length === 0) return "NONE";
  return mediaList.some((item) => item.type === "video") ? "VIDEO" : "IMAGE";
}
