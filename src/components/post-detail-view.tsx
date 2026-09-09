"use client";

import Link from "next/link";
import { MediaGrid } from "@/components/media-grid";
import { UserAvatar } from "@/components/user-avatar";
import { LikeSection } from "@/components/like-section";
import { PostCommentsSection } from "@/components/post-comments-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PostDetailData } from "@/lib/post-detail";

interface PostDetailViewProps {
  post: PostDetailData;
  variant?: "page" | "overlay";
}

function AuthorHeader({ post }: { post: PostDetailData }) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/user/${encodeURIComponent(post.author.username)}`}
        className="shrink-0 rounded-full ring-offset-background transition-opacity hover:opacity-80"
      >
        <UserAvatar
          username={post.author.username}
          avatar={post.author.avatar}
          size="lg"
        />
      </Link>
      <div className="min-w-0">
        <Link
          href={`/user/${encodeURIComponent(post.author.username)}`}
          className="font-medium hover:underline"
        >
          {post.author.username}
        </Link>
        <p className="text-xs text-muted-foreground">
          {new Date(post.createdAt).toLocaleString("zh-CN")}
        </p>
      </div>
    </div>
  );
}

function PostTextContent({ post }: { post: PostDetailData }) {
  return (
    <>
      {post.title && (
        <h1 className="text-xl font-bold tracking-tight">{post.title}</h1>
      )}
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
        {post.content}
      </p>
    </>
  );
}

function PostTags({ post }: { post: PostDetailData }) {
  if (post.postTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {post.postTags.map(({ tag }) => (
        <Badge key={tag.id} variant="secondary" asChild>
          <Link href={`/?tag=${encodeURIComponent(tag.name)}`}>
            #{tag.name}
          </Link>
        </Badge>
      ))}
    </div>
  );
}

function PostOverlayLayout({ post }: { post: PostDetailData }) {
  const hasMedia = post.media.length > 0;

  return (
    <div
      className={
        hasMedia
          ? "grid h-full min-h-0 grid-cols-1 md:grid-cols-[1.05fr_1fr]"
          : "flex h-full min-h-0 flex-col"
      }
    >
      {hasMedia && (
        <div className="relative flex min-h-[220px] items-center justify-center bg-muted/20 md:min-h-0">
          <MediaGrid media={post.media} variant="overlay" />
        </div>
      )}

      <div className="flex min-h-0 flex-col border-border/40 md:border-l md:border-t-0 border-t">
        <div className="shrink-0 space-y-3 border-b border-border/40 px-4 py-4">
          <AuthorHeader post={post} />
          <PostTextContent post={post} />
          <PostTags post={post} />
          <LikeSection
            postId={post.id}
            initialLikeCount={post.likeCount}
            initialIsLiked={post.isLiked}
            compact
          />
        </div>

        <PostCommentsSection
          postId={post.id}
          commentCount={post.commentCount}
          variant="overlay"
        />
      </div>
    </div>
  );
}

export function PostDetailView({
  post,
  variant = "page",
}: PostDetailViewProps) {
  if (variant === "overlay") {
    return <PostOverlayLayout post={post} />;
  }

  return (
    <>
      <Card className="border-border/60 shadow-none">
        <CardContent className="pt-6">
          <AuthorHeader post={post} />
          <div className="mt-6 space-y-4">
            <PostTextContent post={post} />
            <MediaGrid media={post.media} />
            <PostTags post={post} />
          </div>

          <Separator className="my-6" />

          <div className="flex flex-wrap items-center gap-4">
            <LikeSection
              postId={post.id}
              initialLikeCount={post.likeCount}
              initialIsLiked={post.isLiked}
            />
            <span className="text-sm text-muted-foreground">
              {post.commentCount} 条评论
            </span>
          </div>
        </CardContent>
      </Card>

      <PostCommentsSection postId={post.id} commentCount={post.commentCount} />
    </>
  );
}
