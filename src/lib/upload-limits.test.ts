import { describe, it, expect } from "vitest";
import {
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  getMaxUploadBytes,
  validateUploadFileSize,
} from "./upload-limits";

describe("upload-limits", () => {
  it("图片上限 10MB，视频上限 50MB", () => {
    expect(getMaxUploadBytes("image/jpeg")).toBe(MAX_IMAGE_BYTES);
    expect(getMaxUploadBytes("video/mp4")).toBe(MAX_VIDEO_BYTES);
  });

  it("超出限制时返回可读错误", () => {
    expect(
      validateUploadFileSize({
        size: MAX_IMAGE_BYTES + 1,
        type: "image/png",
      })
    ).toBe("图片大小不能超过 10MB");

    expect(
      validateUploadFileSize({
        size: MAX_VIDEO_BYTES + 1,
        type: "video/mp4",
      })
    ).toBe("视频大小不能超过 50MB");
  });

  it("未超出限制时返回 null", () => {
    expect(
      validateUploadFileSize({
        size: MAX_IMAGE_BYTES,
        type: "image/webp",
      })
    ).toBeNull();
  });
});
