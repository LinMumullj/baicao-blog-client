"use client";

import { useState } from "react";
import { LikeButton } from "@/components/like-button";
import { LikeAvatarsPreview } from "@/components/like-avatars-preview";
import { LikeListDialog } from "@/components/like-list-dialog";

interface LikeSectionProps {
  postId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
}

export function LikeSection({
  postId,
  initialLikeCount,
  initialIsLiked,
}: LikeSectionProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [listOpen, setListOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <LikeButton
          postId={postId}
          initialLikeCount={likeCount}
          initialIsLiked={initialIsLiked}
          onLikeCountChange={setLikeCount}
        />
        {likeCount > 0 && (
          <button
            type="button"
            onClick={() => setListOpen(true)}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            查看点赞者
          </button>
        )}
      </div>
      <LikeAvatarsPreview
        postId={postId}
        likeCount={likeCount}
        onExpand={() => setListOpen(true)}
      />
      <LikeListDialog
        postId={postId}
        open={listOpen}
        onOpenChange={setListOpen}
      />
    </div>
  );
}
