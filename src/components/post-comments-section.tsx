"use client";

import { useState } from "react";
import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";

interface PostCommentsSectionProps {
  postId: string;
}

export function PostCommentsSection({ postId }: PostCommentsSectionProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-semibold">评论</h2>
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
