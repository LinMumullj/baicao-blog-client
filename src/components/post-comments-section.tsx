"use client";

import { useState } from "react";
import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";

interface PostCommentsSectionProps {
  postId: string;
  commentCount?: number;
  variant?: "page" | "overlay";
}

export function PostCommentsSection({
  postId,
  commentCount,
  variant = "page",
}: PostCommentsSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  if (variant === "overlay") {
    return (
      <section className="flex flex-col md:min-h-0 md:flex-1">
        <div className="shrink-0 border-b border-border/40 px-4 py-2.5 md:border-b-0">
          <h2 className="text-sm font-medium text-muted-foreground">
            评论{commentCount !== undefined ? ` · ${commentCount}` : ""}
          </h2>
        </div>
        <div className="px-4 py-3 md:overlay-scroll md:min-h-0 md:flex-1 md:overflow-y-auto md:pb-3">
          <CommentList postId={postId} refreshKey={refreshKey} compact />
        </div>
        <div className="shrink-0 border-t border-border/40 bg-background/95 px-4 py-3 max-md:sticky max-md:bottom-0 max-md:backdrop-blur-md">
          <CommentForm
            postId={postId}
            onCommentAdded={() => setRefreshKey((k) => k + 1)}
            compact
          />
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-semibold">
        评论{commentCount !== undefined ? ` (${commentCount})` : ""}
      </h2>
      <CommentForm
        postId={postId}
        onCommentAdded={() => setRefreshKey((k) => k + 1)}
      />
      <div className="mt-6">
        <CommentList postId={postId} refreshKey={refreshKey} />
      </div>
    </section>
  );
}
