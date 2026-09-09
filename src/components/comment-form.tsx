"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { EmojiPicker, insertAtCursor } from "@/components/emoji-picker";

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const { data: session } = useSession();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!session?.user) {
    return (
      <Card className="border-border/60 shadow-none">
        <CardContent className="py-4 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            登录
          </Link>
          后评论
        </CardContent>
      </Card>
    );
  }

  function handleEmojiSelect(emoji: string) {
    const textarea = contentRef.current;
    if (!textarea) {
      setContent((value) => value + emoji);
      return;
    }

    const { nextValue, nextCursor } = insertAtCursor(
      content,
      emoji,
      textarea.selectionStart,
      textarea.selectionEnd
    );
    setContent(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
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
      <Textarea
        ref={contentRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写下你的评论..."
        rows={3}
        className="resize-none"
      />
      <div className="flex items-center justify-between gap-3">
        <EmojiPicker onSelect={handleEmojiSelect} disabled={submitting} />
        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || submitting}
        >
          {submitting ? "提交中..." : "发表评论"}
        </Button>
      </div>
    </form>
  );
}
