"use client";

import { useState } from "react";
import { LikeButton } from "@/components/like-button";
import { LikeAvatarsPreview } from "@/components/like-avatars-preview";
import { LikeListDialog } from "@/components/like-list-dialog";

interface LikeSectionProps {
  postId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  compact?: boolean;
}

export function LikeSection({
  postId,
  initialLikeCount,
  initialIsLiked,
  compact = false,
}: LikeSectionProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [listOpen, setListOpen] = useState(false);

  return (
    <>
      <div
        className={
          compact
            ? "flex items-center gap-2.5"
            : "space-y-3"
        }
      >
        <LikeButton
          postId={postId}
          initialLikeCount={likeCount}
          initialIsLiked={initialIsLiked}
          onLikeCountChange={setLikeCount}
          showCount={!compact}
        />
        {likeCount > 0 && (
          <LikeAvatarsPreview
            postId={postId}
            likeCount={likeCount}
            onExpand={() => setListOpen(true)}
            compact={compact}
          />
        )}
      </div>
      <LikeListDialog
        postId={postId}
        open={listOpen}
        onOpenChange={setListOpen}
      />
    </>
  );
}
