"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!session?.user) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
        <Link href="/login" className="underline underline-offset-4 hover:text-black dark:hover:text-white">
          登录
        </Link>
        后评论
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: content.trim() }),
      });

      if (res.ok) {
        setContent("");
        onCommentAdded?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的评论..."
        rows={3}
        className="w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-black outline-none placeholder:text-neutral-400 focus:border-black dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-white"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="rounded-lg bg-black px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40 dark:bg-white dark:text-black"
        >
          {submitting ? "提交中..." : "发表评论"}
        </button>
      </div>
    </form>
  );
}
