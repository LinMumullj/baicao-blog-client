import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "./route";

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

const { db } = await import("@/lib/db");
const { auth } = await import("@/lib/auth");
const mockedAuth = vi.mocked(auth);

describe("PATCH /api/users/avatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("登录用户更新头像 → 200", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "user-1", name: "alice", role: "MEMBER" },
      expires: "",
    } as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    vi.mocked(db.user.update).mockResolvedValue({
      id: "user-1",
      username: "alice",
      avatar: "https://oss.example.com/avatar.jpg",
      role: "MEMBER",
      password: "hash",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = new Request("http://localhost/api/users/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avatarUrl: "https://oss.example.com/avatar.jpg",
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });

  it("未登录 → 401", async () => {
    mockedAuth.mockResolvedValue(null as ReturnType<typeof auth> extends Promise<infer T> ? T : never);

    const req = new Request("http://localhost/api/users/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: "https://oss.example.com/a.jpg" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });
});
