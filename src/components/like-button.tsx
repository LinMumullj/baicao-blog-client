"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  postId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
}

export function LikeButton({
  postId,
  initialLikeCount,
  initialIsLiked,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (pending) return;

    const prevLiked = liked;
    const prevCount = likeCount;

    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    setPending(true);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!res.ok) {
        setLiked(prevLiked);
        setLikeCount(prevCount);
        return;
      }

      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
    >
      <Heart
        className={`h-4 w-4 ${liked ? "fill-white text-white" : ""}`}
      />
      {likeCount > 0 && likeCount}
    </button>
  );
}
