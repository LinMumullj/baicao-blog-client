import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/db", () => ({
  db: {
    post: {
      findUnique: vi.fn(),
    },
    like: {
      findMany: vi.fn(),
    },
  },
}));

const { db } = await import("@/lib/db");
const postFindUnique = vi.mocked(db.post.findUnique);
const likeFindMany = vi.mocked(db.like.findMany);

function makeRequest(postId: string, params?: Record<string, string>) {
  const url = new URL(`http://localhost:3000/api/posts/${postId}/likes`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("GET /api/posts/[id]/likes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("返回点赞者列表 → 200", async () => {
    postFindUnique.mockResolvedValue({ id: "post-1" } as never);
    likeFindMany.mockResolvedValue([
      {
        id: "like-1",
        userId: "user-1",
        postId: "post-1",
        createdAt: new Date(),
        user: { id: "user-1", username: "alice", avatar: null },
      },
    ] as never);

    const res = await GET(makeRequest("post-1"), {
      params: Promise.resolve({ id: "post-1" }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.likers).toHaveLength(1);
    expect(data.likers[0].username).toBe("alice");
  });

  it("动态不存在 → 404", async () => {
    postFindUnique.mockResolvedValue(null as never);

    const res = await GET(makeRequest("missing"), {
      params: Promise.resolve({ id: "missing" }),
    });
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe("动态不存在");
  });

  it("空列表 → 200", async () => {
    postFindUnique.mockResolvedValue({ id: "post-1" } as never);
    likeFindMany.mockResolvedValue([] as never);

    const res = await GET(makeRequest("post-1"), {
      params: Promise.resolve({ id: "post-1" }),
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.likers).toEqual([]);
    expect(data.nextCursor).toBeNull();
  });
});
