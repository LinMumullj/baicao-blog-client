"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PostCard } from "@/components/post-card";
import { Cat, Loader2 } from "lucide-react";

interface Post {
  id: string;
  content: string;
  title?: string | null;
  isLongPost: boolean;
  createdAt: string;
  author: { id: string; username: string; avatar?: string | null };
  media: { id: string; url: string; type: string; order: number }[];
  postTags: { tag: { id: string; name: string } }[];
  _count: { comments: number; likes: number };
}

interface PostFeedProps {
  tag?: string;
}

export function PostFeed({ tag }: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback(
    async (cursor?: string) => {
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      if (tag) params.set("tag", tag);

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      return data;
    },
    [tag]
  );

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setNextCursor(null);

    fetchPosts().then((data) => {
      setPosts(data.posts || []);
      setNextCursor(data.nextCursor);
      setLoading(false);
    });
  }, [fetchPosts]);

  useEffect(() => {
    if (!observerRef.current || !nextCursor) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore) {
          setLoadingMore(true);
          const data = await fetchPosts(nextCursor);
          setPosts((prev) => [...prev, ...(data.posts || [])]);
          setNextCursor(data.nextCursor);
          setLoadingMore(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, fetchPosts]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Cat className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">还没有动态</p>
        <p className="mt-1 text-sm text-muted-foreground">
          等管理员发布第一条动态吧 🐾
        </p>
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={observerRef} className="h-10">
        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {!nextCursor && posts.length > 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          — 没有更多了 —
        </p>
      )}
    </div>
  );
}
