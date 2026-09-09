"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setTags(data));
  }, []);

  if (tags.length === 0) return null;

  function navigate(nextTag?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextTag) {
      params.set("tag", nextTag);
    } else {
      params.delete("tag");
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/40 bg-background/60 px-4 py-3 backdrop-blur-sm">
      <Badge
        variant={!currentTag ? "default" : "outline"}
        className="cursor-pointer transition-colors"
        onClick={() => navigate()}
      >
        全部
      </Badge>
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant={currentTag === tag.name ? "default" : "outline"}
          className="cursor-pointer transition-colors"
          onClick={() => navigate(tag.name)}
        >
          {tag.name}
        </Badge>
      ))}
    </div>
  );
}
