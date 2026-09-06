import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { MediaGrid } from "@/components/media-grid";
import { UserAvatar } from "@/components/user-avatar";
import { LikeButton } from "@/components/like-button";
import { PostCommentsSection } from "@/components/post-comments-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      media: { orderBy: { order: "asc" } },
      postTags: { include: { tag: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  if (!post) notFound();

  let isLiked = false;
  if (session?.user?.id) {
    const like = await db.like.findUnique({
      where: {
        userId_postId: { userId: session.user.id, postId: id },
      },
    });
    isLiked = !!like;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
      </Button>

      <Card className="border-border/60 shadow-none">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <UserAvatar
              username={post.author.username}
              avatar={post.author.avatar}
              size="lg"
            />
            <div>
              <p className="font-medium">{post.author.username}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleString("zh-CN")}
              </p>
            </div>
          </div>

          {post.title && (
            <h1 className="mt-6 text-2xl font-bold tracking-tight">
              {post.title}
            </h1>
          )}
          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-foreground/90">
            {post.content}
          </p>

          <MediaGrid media={post.media} />

          {post.postTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.postTags.map(({ tag }) => (
                <Badge key={tag.id} variant="secondary" asChild>
                  <Link href={`/?tag=${encodeURIComponent(tag.name)}`}>
                    #{tag.name}
                  </Link>
                </Badge>
              ))}
            </div>
          )}

          <Separator className="my-6" />

          <div className="flex items-center gap-4">
            <LikeButton
              postId={post.id}
              initialLikeCount={post._count.likes}
              initialIsLiked={isLiked}
            />
            <span className="text-sm text-muted-foreground">
              {post._count.comments} 条评论
            </span>
          </div>
        </CardContent>
      </Card>

      <PostCommentsSection postId={post.id} />
    </div>
  );
}
