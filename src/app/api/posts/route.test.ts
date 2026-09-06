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
    like: {
      findMany: vi.fn(),
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
const likeFindMany = vi.mocked(db.like.findMany);

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

  it("member 创建动态 → 201", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "member-id", name: "member", role: "MEMBER" },
      expires: "",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    const createdPost = {
      id: "member-post",
      content: "测试",
      title: null,
      isLongPost: false,
      mediaType: "NONE",
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: "member-id",
    };

    vi.mocked(db.$transaction).mockImplementation(async (fn: unknown) => {
      if (typeof fn === "function") {
        return fn({
          post: { create: vi.fn().mockResolvedValue(createdPost) },
          media: { createMany: vi.fn().mockResolvedValue({ count: 0 }) },
        });
      }
      return fn;
    });

    const req = makePostRequest({ content: "测试" });
    const res = await POST(req);

    expect(res.status).toBe(201);
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

  it("图视频互斥提交 → 400", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "admin-id", name: "admin", role: "ADMIN" },
      expires: "",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    const req = makePostRequest({
      content: "混合媒体测试",
      mediaUrls: [
        { url: "https://oss.example.com/photo.jpg", type: "image" },
        { url: "https://oss.example.com/clip.mp4", type: "video" },
      ],
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("图片和视频不能同时上传");
  });

  it("视频动态创建 → 201", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "admin-id", name: "admin", role: "ADMIN" },
      expires: "",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    const createdPost = {
      id: "video-post",
      content: "视频动态",
      title: null,
      isLongPost: false,
      mediaType: "VIDEO",
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: "admin-id",
    };

    vi.mocked(db.$transaction).mockImplementation(async (fn: unknown) => {
      if (typeof fn === "function") {
        return fn({
          post: { create: vi.fn().mockResolvedValue(createdPost) },
          media: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
        });
      }
      return fn;
    });

    const req = makePostRequest({
      content: "视频动态",
      mediaUrls: [
        { url: "https://oss.example.com/video.mp4", type: "video" },
      ],
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("长文动态创建 → 201", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "admin-id", name: "admin", role: "ADMIN" },
      expires: "",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    const createdPost = {
      id: "long-post",
      content: "这是一篇长文的正文内容",
      title: "长文标题",
      isLongPost: true,
      mediaType: "NONE",
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: "admin-id",
    };

    vi.mocked(db.$transaction).mockImplementation(async (fn: unknown) => {
      if (typeof fn === "function") {
        return fn({
          post: { create: vi.fn().mockResolvedValue(createdPost) },
          media: { createMany: vi.fn().mockResolvedValue({ count: 0 }) },
        });
      }
      return fn;
    });

    const req = makePostRequest({
      content: "这是一篇长文的正文内容",
      title: "长文标题",
      isLongPost: true,
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
  });
});

describe("GET /api/posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMany.mockResolvedValue(mockPosts as never);
    likeFindMany.mockResolvedValue([]);
    mockedAuth.mockResolvedValue(null as ReturnType<typeof auth> extends Promise<infer T> ? T : never);
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
