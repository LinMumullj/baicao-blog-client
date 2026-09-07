import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PUT, DELETE } from "./route";

const mockPost = {
  id: "post-1",
  content: "原内容",
  title: "原标题",
  isLongPost: true,
  mediaType: "NONE",
  createdAt: new Date(),
  updatedAt: new Date(),
  authorId: "admin-id",
  author: { id: "admin-id", username: "admin", avatar: null },
  media: [],
  postTags: [{ tag: { id: "tag-1", name: "日常" } }],
  _count: { comments: 2, likes: 3 },
};

vi.mock("@/lib/db", () => ({
  db: {
    post: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    postTag: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

const { db } = await import("@/lib/db");
const { auth } = await import("@/lib/auth");
const mockedAuth = vi.mocked(auth);

function adminSession() {
  return {
    user: { id: "admin-id", name: "admin", role: "ADMIN" },
    expires: "",
  } as ReturnType<typeof auth> extends Promise<infer T> ? T : never;
}

function memberSession() {
  return {
    user: { id: "member-id", name: "member", role: "MEMBER" },
    expires: "",
  } as ReturnType<typeof auth> extends Promise<infer T> ? T : never;
}

describe("PUT /api/posts/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.post.findUnique).mockResolvedValue(mockPost as never);
    vi.mocked(db.$transaction).mockImplementation(async (fn: unknown) => {
      if (typeof fn === "function") {
        return fn({
          post: {
            update: vi.fn().mockResolvedValue({
              ...mockPost,
              content: "新内容",
              title: "新标题",
            }),
          },
          postTag: { deleteMany: vi.fn(), create: vi.fn() },
        });
      }
      return fn;
    });
  });

  it("admin 编辑动态 → 200", async () => {
    mockedAuth.mockResolvedValue(adminSession());

    const req = new Request("http://localhost/api/posts/post-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "新内容",
        title: "新标题",
        isLongPost: true,
        tags: ["日常", "旅行"],
      }),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: "post-1" }) });
    expect(res.status).toBe(200);
  });

  it("非 admin 编辑 → 403", async () => {
    mockedAuth.mockResolvedValue(memberSession());

    const req = new Request("http://localhost/api/posts/post-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "新内容" }),
    });

    const res = await PUT(req, { params: Promise.resolve({ id: "post-1" }) });
    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/posts/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.post.findUnique).mockResolvedValue(mockPost as never);
    vi.mocked(db.post.delete).mockResolvedValue(mockPost as never);
  });

  it("admin 删除动态 → 200", async () => {
    mockedAuth.mockResolvedValue(adminSession());

    const req = new Request("http://localhost/api/posts/post-1", {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: "post-1" }) });
    expect(res.status).toBe(200);
    expect(db.post.delete).toHaveBeenCalledWith({ where: { id: "post-1" } });
  });

  it("非 admin 删除 → 403", async () => {
    mockedAuth.mockResolvedValue(memberSession());

    const req = new Request("http://localhost/api/posts/post-1", {
      method: "DELETE",
    });

    const res = await DELETE(req, { params: Promise.resolve({ id: "post-1" }) });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/posts/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.post.findUnique).mockResolvedValue(mockPost as never);
  });

  it("返回动态详情", async () => {
    const req = new Request("http://localhost/api/posts/post-1");
    const res = await GET(req, { params: Promise.resolve({ id: "post-1" }) });
    expect(res.status).toBe(200);
  });
});
