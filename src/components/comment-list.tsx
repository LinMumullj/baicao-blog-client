"use client";

import { useState, useEffect, useCallback } from "react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; username: string; avatar?: string | null };
}

interface CommentListProps {
  postId: string;
}

export function CommentList({ postId }: CommentListProps) {
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
    fetchComments();
  }, [fetchComments]);

  if (loading) {
    return (
      <div className="py-6 text-center text-sm text-neutral-500">
        加载评论中...
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-neutral-500">
        暂无评论
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const initial = comment.author.username.charAt(0).toUpperCase();
        const timeStr = new Date(comment.createdAt).toLocaleString("zh-CN", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div key={comment.id} className="flex gap-3">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.username}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-black dark:text-white">
                  {comment.author.username}
                </span>
                <span className="text-xs text-neutral-400">{timeStr}</span>
              </div>
              <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                {comment.content}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
