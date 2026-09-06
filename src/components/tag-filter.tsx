"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface Tag {
  id: string;
  name: string;
  _count: { postTags: number };
}

interface TagFilterProps {
  currentTag?: string;
}

export function TagFilter({ currentTag }: TagFilterProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setTags(data));
  }, []);

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/40 bg-background/60 px-4 py-3 backdrop-blur-sm">
      <Badge
        variant={!currentTag ? "default" : "outline"}
        className="cursor-pointer transition-colors"
        onClick={() => router.push("/")}
      >
        全部
      </Badge>
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant={currentTag === tag.name ? "default" : "outline"}
          className="cursor-pointer transition-colors"
          onClick={() => router.push(`/?tag=${encodeURIComponent(tag.name)}`)}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
