"use client";

import { useState, useEffect, useCallback } from "react";
import { UserAvatar } from "@/components/user-avatar";
import { CatLoader } from "@/components/cat-loader";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string; avatar?: string | null };
}

interface CommentListProps {
  postId: string;
  refreshKey?: number;
  compact?: boolean;
}

export function CommentList({
  postId,
  refreshKey = 0,
  compact = false,
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      const data = await res.json();
      setComments(data);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    setLoading(true);
    fetchComments();
  }, [fetchComments, refreshKey]);

  if (loading) {
    return <CatLoader label="加载评论中..." />;
  }

  if (comments.length === 0) {
    return (
      <p
        className={`text-center text-sm text-muted-foreground ${compact ? "py-6" : "py-8"}`}
      >
        暂无评论，来抢沙发吧
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {comments.map((comment) => {
        const timeStr = new Date(comment.createdAt).toLocaleString("zh-CN", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div key={comment.id} className="flex gap-2.5">
            <UserAvatar
              username={comment.author.username}
              avatar={comment.author.avatar}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{comment.author.username}</span>
                <span className="text-xs text-muted-foreground">{timeStr}</span>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">
                {comment.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
