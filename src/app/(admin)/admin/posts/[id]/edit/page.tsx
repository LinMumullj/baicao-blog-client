import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EditPostForm } from "@/components/edit-post-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  const post = await db.post.findUnique({
    where: { id },
    include: {
      media: { orderBy: { order: "asc" } },
      postTags: { include: { tag: true } },
    },
  });

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/admin/posts">
          <ArrowLeft className="h-4 w-4" />
          返回管理列表
        </Link>
      </Button>
      <EditPostForm post={post} successHref="/admin/posts" />
    </div>
  );
}
