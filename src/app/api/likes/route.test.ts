import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/db", () => ({
  db: {
    like: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

const { db } = await import("@/lib/db");
const { auth } = await import("@/lib/auth");
const mockedAuth = vi.mocked(auth);
const findUnique = vi.mocked(db.like.findUnique);
const createLike = vi.mocked(db.like.create);
const deleteLike = vi.mocked(db.like.delete);
const countLike = vi.mocked(db.like.count);

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/likes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/likes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("点赞成功 → 200", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "user-1", name: "test" },
      expires: "",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    findUnique.mockResolvedValue(null as never);
    createLike.mockResolvedValue({
      id: "like-1",
      userId: "user-1",
      postId: "post-1",
      createdAt: new Date(),
    } as never);
    countLike.mockResolvedValue(1 as never);

    const res = await POST(makeRequest({ postId: "post-1" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.liked).toBe(true);
    expect(data.likeCount).toBe(1);
    expect(createLike).toHaveBeenCalledWith({
      data: { userId: "user-1", postId: "post-1" },
    });
  });

  it("取消赞 → 200", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "user-1", name: "test" },
      expires: "",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    findUnique.mockResolvedValue({
      id: "like-1",
      userId: "user-1",
      postId: "post-1",
      createdAt: new Date(),
    } as never);
    deleteLike.mockResolvedValue({
      id: "like-1",
      userId: "user-1",
      postId: "post-1",
      createdAt: new Date(),
    } as never);
    countLike.mockResolvedValue(0 as never);

    const res = await POST(makeRequest({ postId: "post-1" }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.liked).toBe(false);
    expect(data.likeCount).toBe(0);
    expect(deleteLike).toHaveBeenCalledWith({
      where: { userId_postId: { userId: "user-1", postId: "post-1" } },
    });
  });

  it("未登录 → 401", async () => {
    mockedAuth.mockResolvedValue(
      null as ReturnType<typeof auth> extends Promise<infer T> ? T : never
    );

    const res = await POST(makeRequest({ postId: "post-1" }));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe("请先登录");
  });
});
