import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";

vi.mock("@/lib/db", () => ({
  db: {
    comment: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

const { db } = await import("@/lib/db");
const { auth } = await import("@/lib/auth");
const mockedAuth = vi.mocked(auth);
const createComment = vi.mocked(db.comment.create);
const findManyComments = vi.mocked(db.comment.findMany);

function makePostRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(params?: Record<string, string>) {
  const url = new URL("http://localhost:3000/api/comments");
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("POST /api/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("发评论 → 201", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "user-1", name: "testuser", role: "MEMBER" },
      expires: "",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    const createdComment = {
      id: "comment-1",
      content: "好文章！",
      postId: "post-1",
      authorId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: "user-1", username: "testuser", avatar: null },
    };

    createComment.mockResolvedValue(createdComment as never);

    const req = makePostRequest({ postId: "post-1", content: "好文章！" });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.content).toBe("好文章！");
    expect(data.author.username).toBe("testuser");
  });

  it("未登录 → 401", async () => {
    mockedAuth.mockResolvedValue(
      null as ReturnType<typeof auth> extends Promise<infer T> ? T : never
    );

    const req = makePostRequest({ postId: "post-1", content: "测试" });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });
});

describe("GET /api/comments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("获取评论列表 → 200", async () => {
    const mockComments = [
      {
        id: "comment-1",
        content: "第一条评论",
        postId: "post-1",
        authorId: "user-1",
        createdAt: new Date("2026-09-06T10:00:00Z"),
        updatedAt: new Date("2026-09-06T10:00:00Z"),
        author: { id: "user-1", username: "alice", avatar: null },
      },
      {
        id: "comment-2",
        content: "第二条评论",
        postId: "post-1",
        authorId: "user-2",
        createdAt: new Date("2026-09-06T11:00:00Z"),
        updatedAt: new Date("2026-09-06T11:00:00Z"),
        author: { id: "user-2", username: "bob", avatar: null },
      },
    ];

    findManyComments.mockResolvedValue(mockComments as never);

    const req = makeGetRequest({ postId: "post-1" });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0].content).toBe("第一条评论");
    expect(data[1].content).toBe("第二条评论");
    expect(findManyComments).toHaveBeenCalledWith({
      where: { postId: "post-1" },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
      },
    });
  });
});
