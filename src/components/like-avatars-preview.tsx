"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
}

export function LikeAvatarsPreview({
  postId,
  likeCount,
  onExpand,
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

  const overflow = likeCount - likers.length;

  return (
    <button
      type="button"
      onClick={onExpand}
      className="flex items-center gap-2 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-muted/60"
    >
      <div className="flex -space-x-2">
        {likers.map((liker) => (
          <UserAvatar
            key={liker.id}
            username={liker.username}
            avatar={liker.avatar}
            className="ring-2 ring-background"
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {overflow > 0 ? `等 ${likeCount} 人赞过` : `${likeCount} 人赞过`}
      </span>
    </button>
  );
}
