import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";

const mockPosts = [
  {
    id: "post-1",
    content: "第一条动态",
    title: null,
    isLongPost: false,
    mediaType: "IMAGE",
    createdAt: new Date("2026-09-06T10:00:00Z"),
    updatedAt: new Date("2026-09-06T10:00:00Z"),
    authorId: "admin-id",
    author: { id: "admin-id", username: "admin", avatar: null },
    media: [
      { id: "m1", url: "https://oss.example.com/1.jpg", type: "image", order: 0 },
    ],
    postTags: [],
    _count: { comments: 0, likes: 0 },
  },
];

vi.mock("@/lib/db", () => ({
  db: {
    post: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    media: {
      createMany: vi.fn(),
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
const findMany = vi.mocked(db.post.findMany);

function makePostRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(params?: Record<string, string>) {
  const url = new URL("http://localhost:3000/api/posts");
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new Request(url.toString(), { method: "GET" });
}

describe("POST /api/posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("admin 创建动态 → 201", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "admin-id", name: "admin", role: "ADMIN" },
      expires: "",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    const createdPost = {
      id: "new-post",
      content: "测试动态",
      title: null,
      isLongPost: false,
      mediaType: "IMAGE",
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: "admin-id",
    };

    vi.mocked(db.$transaction).mockImplementation(async (fn: unknown) => {
      if (typeof fn === "function") {
        return fn({
          post: { create: vi.fn().mockResolvedValue(createdPost) },
          media: { createMany: vi.fn().mockResolvedValue({ count: 2 }) },
        });
      }
      return fn;
    });

    const req = makePostRequest({
      content: "测试动态",
      mediaUrls: [
        { url: "https://oss.example.com/1.jpg", type: "image" },
        { url: "https://oss.example.com/2.jpg", type: "image" },
      ],
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("member 创建动态 → 403", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "member-id", name: "member", role: "MEMBER" },
      expires: "",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    const req = makePostRequest({ content: "测试" });
    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  it("未登录 → 401", async () => {
    mockedAuth.mockResolvedValue(null as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    const req = makePostRequest({ content: "测试" });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("超过 9 张图 → 400", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "admin-id", name: "admin", role: "ADMIN" },
      expires: "",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    const req = makePostRequest({
      content: "测试",
      mediaUrls: Array.from({ length: 10 }, (_, i) => ({
        url: `https://oss.example.com/${i}.jpg`,
        type: "image",
      })),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

describe("GET /api/posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMany.mockResolvedValue(mockPosts as never);
  });

  it("返回动态列表", async () => {
    const req = makeGetRequest();
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.posts).toBeDefined();
    expect(findMany).toHaveBeenCalled();
  });

  it("支持 cursor 分页", async () => {
    findMany.mockResolvedValue([] as never);

    const req = makeGetRequest({ cursor: "some-cursor-id" });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.posts).toBeDefined();
  });
});
