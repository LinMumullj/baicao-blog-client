"use client";

import { useEffect, useState } from "react";
import { UserAvatar } from "@/components/user-avatar";

interface Liker {
  id: string;
  username: string;
  avatar: string | null;
}

interface LikeAvatarsPreviewProps {
  postId: string;
  likeCount: number;
  onExpand: () => void;
  compact?: boolean;
}

function formatLikeLabel(likers: Liker[], total: number): string {
  if (total === 1) {
    return likers[0] ? `${likers[0].username} 赞过` : "1 人赞过";
  }

  if (total === 2 && likers.length >= 2) {
    return `${likers[0].username}、${likers[1].username} 赞过`;
  }

  if (likers.length >= 1 && total <= 3 && likers.length === total) {
    return `${likers.map((l) => l.username).join("、")} 赞过`;
  }

  if (likers.length >= 1) {
    return `${total} 人赞过`;
  }

  return `${total} 人赞过`;
}

export function LikeAvatarsPreview({
  postId,
  likeCount,
  onExpand,
  compact = false,
}: LikeAvatarsPreviewProps) {
  const [likers, setLikers] = useState<Liker[]>([]);

  useEffect(() => {
    if (likeCount === 0) return;

    fetch(`/api/posts/${postId}/likes?limit=5`)
      .then((res) => res.json())
      .then((data) => setLikers(data.likers ?? []))
      .catch(() => setLikers([]));
  }, [postId, likeCount]);

  if (likeCount === 0) return null;

  const previewLikers = likers.slice(0, compact ? 3 : 5);

  return (
    <button
      type="button"
      onClick={onExpand}
      className="flex min-w-0 items-center gap-2 rounded-md py-0.5 text-left transition-colors hover:opacity-80"
    >
      {previewLikers.length > 0 && (
        <div className="flex shrink-0 -space-x-1.5">
          {previewLikers.map((liker) => (
            <UserAvatar
              key={liker.id}
              username={liker.username}
              avatar={liker.avatar}
              className="ring-2 ring-background"
            />
          ))}
        </div>
      )}
      <span className="truncate text-xs text-muted-foreground">
        {formatLikeLabel(likers, likeCount)}
      </span>
    </button>
  );
}
