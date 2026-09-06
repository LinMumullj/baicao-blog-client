"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
      <button
        onClick={() => router.push("/")}
        className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${
          !currentTag
            ? "bg-foreground text-background"
            : "border-border hover:bg-muted"
        }`}
      >
        全部
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => router.push(`/?tag=${encodeURIComponent(tag.name)}`)}
          className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${
            currentTag === tag.name
              ? "bg-foreground text-background"
              : "border-border hover:bg-muted"
          }`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
