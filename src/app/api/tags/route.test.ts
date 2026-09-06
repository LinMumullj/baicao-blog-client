import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/db", () => ({
  db: {
    tag: {
      findMany: vi.fn(),
    },
  },
}));

const { db } = await import("@/lib/db");
const findMany = vi.mocked(db.tag.findMany);

const mockTags = [
  { id: "t1", name: "Next.js", _count: { postTags: 5 } },
  { id: "t2", name: "React", _count: { postTags: 3 } },
  { id: "t3", name: "TypeScript", _count: { postTags: 1 } },
];

describe("GET /api/tags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("返回标签列表 200", async () => {
    findMany.mockResolvedValue(mockTags as never);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(mockTags);
    expect(findMany).toHaveBeenCalledWith({
      include: { _count: { select: { postTags: true } } },
      orderBy: { postTags: { _count: "desc" } },
    });
  });
});
