import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/db", () => {
  const mockUser = {
    id: "test-id",
    username: "testuser",
    password: "$2a$12$hashedpassword",
    role: "MEMBER",
    avatar: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    db: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn().mockResolvedValue(mockUser),
      },
    },
  };
});

const { db } = await import("@/lib/db");
const findUnique = vi.mocked(db.user.findUnique);
const create = vi.mocked(db.user.create);

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.INVITE_CODE = "baicaofamily";
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({
      id: "test-id",
      username: "testuser",
      password: "$2a$12$hashedpassword",
      role: "MEMBER",
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it("正确邀请码注册成功 → 201", async () => {
    const req = makeRequest({
      username: "testuser",
      password: "password123",
      inviteCode: "baicaofamily",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(data.username).toBe("testuser");
    expect(data.role).toBe("MEMBER");
    expect(create).toHaveBeenCalledOnce();
  });

  it("错误邀请码 → 403", async () => {
    const req = makeRequest({
      username: "testuser",
      password: "password123",
      inviteCode: "wrongcode",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain("邀请码无效");
    expect(create).not.toHaveBeenCalled();
  });

  it("重复用户名 → 409", async () => {
    findUnique.mockResolvedValue({
      id: "existing-id",
      username: "testuser",
      password: "hashed",
      role: "MEMBER",
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const req = makeRequest({
      username: "testuser",
      password: "password123",
      inviteCode: "baicaofamily",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toContain("用户名已被占用");
    expect(create).not.toHaveBeenCalled();
  });

  it("缺少必填字段 → 400", async () => {
    const req = makeRequest({
      username: "testuser",
      password: "",
      inviteCode: "baicaofamily",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("密码太短 → 400", async () => {
    const req = makeRequest({
      username: "testuser",
      password: "12345",
      inviteCode: "baicaofamily",
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("密码");
  });

  it("用户名太短 → 400", async () => {
    const req = makeRequest({
      username: "a",
      password: "password123",
      inviteCode: "baicaofamily",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
