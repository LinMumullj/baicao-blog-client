"use client";

import Link from "next/link";
import { MediaGrid } from "@/components/media-grid";
import { UserAvatar } from "@/components/user-avatar";
import { LikeButton } from "@/components/like-button";
import { PostCommentsSection } from "@/components/post-comments-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PostDetailData } from "@/lib/post-detail";

interface PostDetailViewProps {
  post: PostDetailData;
  variant?: "page" | "overlay";
}

export function PostDetailView({ post, variant = "page" }: PostDetailViewProps) {
  const cardClassName =
    variant === "overlay"
      ? "border-0 bg-transparent shadow-none"
      : "border-border/60 shadow-none";

  return (
    <>
      <Card className={cardClassName}>
        <CardContent className={variant === "overlay" ? "p-0 pt-0" : "pt-6"}>
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
            <div>
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
              initialLikeCount={post.likeCount}
              initialIsLiked={post.isLiked}
            />
            <span className="text-sm text-muted-foreground">
              {post.commentCount} 条评论
            </span>
          </div>
        </CardContent>
      </Card>

      <PostCommentsSection postId={post.id} />
    </>
  );
}
