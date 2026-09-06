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
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={pending}
      className="h-8 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
    >
      <Heart
        className={`h-4 w-4 transition-colors ${liked ? "fill-foreground text-foreground" : ""}`}
      />
      {likeCount > 0 && <span className="text-xs">{likeCount}</span>}
    </Button>
  );
}
