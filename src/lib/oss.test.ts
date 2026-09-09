import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  extractOssKeyFromUrl,
  isManagedOssUrl,
  parseManagedOssUrl,
  deleteOssObject,
  deleteOssObjectsByUrls,
} from "./oss";

describe("oss url helpers", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("OSS_BUCKET", "mybaicao");
    vi.stubEnv("OSS_REGION", "oss-cn-shenzhen");
    vi.stubEnv("OSS_ENDPOINT", "");
  });

  it("从 OSS URL 提取 object key", () => {
    expect(
      extractOssKeyFromUrl(
        "https://mybaicao.oss-cn-shenzhen.aliyuncs.com/uploads/a.jpg"
      )
    ).toBe("uploads/a.jpg");
  });

  it("识别本 bucket 的 URL", () => {
    expect(
      isManagedOssUrl(
        "https://mybaicao.oss-cn-shenzhen.aliyuncs.com/uploads/a.jpg"
      )
    ).toBe(true);
    expect(isManagedOssUrl("https://example.com/uploads/a.jpg")).toBe(false);
  });

  it("解析删除目标时保留原始 host", () => {
    expect(
      parseManagedOssUrl(
        "https://mybaicao.oss-cn-shenzhen.aliyuncs.com/uploads/a.jpg"
      )
    ).toEqual({
      key: "uploads/a.jpg",
      host: "mybaicao.oss-cn-shenzhen.aliyuncs.com",
    });
  });
});

describe("deleteOssObjectsByUrls", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv("OSS_BUCKET", "mybaicao");
    vi.stubEnv("OSS_REGION", "oss-cn-shenzhen");
    vi.stubEnv("OSS_ACCESS_KEY_ID", "");
    vi.stubEnv("OSS_ACCESS_KEY_SECRET", "");
  });

  it("未配置 OSS 凭证时跳过删除", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    await deleteOssObjectsByUrls([
      "https://mybaicao.oss-cn-shenzhen.aliyuncs.com/uploads/a.jpg",
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("配置凭证时发送 DELETE 请求", async () => {
    vi.stubEnv("OSS_ACCESS_KEY_ID", "test-key");
    vi.stubEnv("OSS_ACCESS_KEY_SECRET", "test-secret");

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(null, { status: 204 })
    );

    await deleteOssObject(
      "uploads/a.jpg",
      "mybaicao.oss-cn-shenzhen.aliyuncs.com"
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://mybaicao.oss-cn-shenzhen.aliyuncs.com/uploads/a.jpg"
    );
    expect(init?.method).toBe("DELETE");
    expect(init?.headers).toMatchObject({
      Authorization: expect.stringMatching(/^OSS test-key:/),
    });
  });
});
