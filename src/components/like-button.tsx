"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  onLikeCountChange?: (count: number) => void;
  showCount?: boolean;
}

export function LikeButton({
  postId,
  initialLikeCount,
  initialIsLiked,
  onLikeCountChange,
  showCount = true,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [pending, setPending] = useState(false);
  const [animating, setAnimating] = useState(false);

  function updateLikeCount(count: number) {
    setLikeCount(count);
    onLikeCountChange?.(count);
  }

  async function handleClick() {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (pending) return;

    const prevLiked = liked;
    const prevCount = likeCount;
    const nextLiked = !liked;

    setLiked(nextLiked);
    updateLikeCount(nextLiked ? likeCount + 1 : likeCount - 1);
    if (nextLiked) {
      setAnimating(true);
      window.setTimeout(() => setAnimating(false), 300);
    }
    setPending(true);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!res.ok) {
        setLiked(prevLiked);
        updateLikeCount(prevCount);
        return;
      }

      const data = await res.json();
      setLiked(data.liked);
      updateLikeCount(data.likeCount);
    } catch {
      setLiked(prevLiked);
      updateLikeCount(prevCount);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={pending}
      className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
    >
      <Heart
        className={`h-4 w-4 transition-colors ${liked ? "fill-foreground text-foreground" : ""} ${animating ? "animate-like-bounce" : ""}`}
      />
      {showCount && likeCount > 0 && (
        <span className="text-xs">{likeCount}</span>
      )}
    </Button>
  );
}
