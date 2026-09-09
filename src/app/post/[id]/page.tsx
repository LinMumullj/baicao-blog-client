import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { fetchPostDetail } from "@/lib/post-detail";
import { PostDetailView } from "@/components/post-detail-view";
import { Button } from "@/components/ui/button";

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const session = await auth();
  const post = await fetchPostDetail(id, session?.user?.id);

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
      </Button>

      <PostDetailView post={post} variant="page" />
    </div>
  );
}
