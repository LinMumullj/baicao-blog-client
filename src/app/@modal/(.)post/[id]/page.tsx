import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { fetchPostDetail } from "@/lib/post-detail";
import { PostOverlay } from "@/components/post-overlay";

interface PostInterceptPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostInterceptPage({
  params,
}: PostInterceptPageProps) {
  const { id } = await params;
  const session = await auth();
  const post = await fetchPostDetail(id, session?.user?.id);

  if (!post) notFound();

  return (
    <PostOverlay post={post} />
  );
}
