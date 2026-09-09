"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui/button";

interface Liker {
  id: string;
  username: string;
  avatar: string | null;
}

interface LikeListDialogProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LikeListDialog({
  postId,
  open,
  onOpenChange,
}: LikeListDialogProps) {
  const [likers, setLikers] = useState<Liker[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchLikers(cursor?: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(`/api/posts/${postId}/likes?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setLikers((prev) =>
          cursor ? [...prev, ...(data.likers ?? [])] : (data.likers ?? [])
        );
        setNextCursor(data.nextCursor ?? null);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      setLikers([]);
      setNextCursor(null);
      fetchLikers();
    }
  }, [open, postId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[70vh] max-w-sm overflow-hidden p-0 sm:max-w-sm">
        <DialogHeader className="border-b border-border/60 px-6 py-4">
          <DialogTitle>点赞者</DialogTitle>
        </DialogHeader>
        <ul className="max-h-[50vh] overflow-y-auto px-2 py-2">
          {likers.map((liker) => (
            <li key={liker.id}>
              <Link
                href={`/user/${encodeURIComponent(liker.username)}`}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/60"
              >
                <UserAvatar username={liker.username} avatar={liker.avatar} />
                <span className="text-sm font-medium">{liker.username}</span>
              </Link>
            </li>
          ))}
        </ul>
        {nextCursor && (
          <div className="border-t border-border/60 px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={loading}
              onClick={() => fetchLikers(nextCursor)}
            >
              {loading ? "加载中..." : "加载更多"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
