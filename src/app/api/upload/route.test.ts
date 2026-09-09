import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { MAX_IMAGE_BYTES } from "@/lib/upload-limits";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/oss", () => ({
  uploadFileToOSS: vi.fn(),
}));

const { auth } = await import("@/lib/auth");
const { uploadFileToOSS } = await import("@/lib/oss");
const mockedAuth = vi.mocked(auth);
const mockedUpload = vi.mocked(uploadFileToOSS);

function createFile(name: string, type: string, size: number) {
  return new File([new Uint8Array(size)], name, { type });
}

describe("POST /api/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue({
      user: { id: "user-1", name: "alice", role: "MEMBER" },
      expires: "",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
  });

  it("图片超过 10MB → 400", async () => {
    const formData = new FormData();
    formData.append(
      "files",
      createFile("large.jpg", "image/jpeg", MAX_IMAGE_BYTES + 1)
    );

    const res = await POST(
      new Request("http://localhost/api/upload", {
        method: "POST",
        body: formData,
      })
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "图片大小不能超过 10MB" });
    expect(mockedUpload).not.toHaveBeenCalled();
  });
});
