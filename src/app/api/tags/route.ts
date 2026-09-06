import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const tags = await db.tag.findMany({
    include: { _count: { select: { postTags: true } } },
    orderBy: { postTags: { _count: "desc" } },
  });
  return NextResponse.json(tags);
}
