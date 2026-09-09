"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface Author {
  username: string;
  avatar: string | null;
  postCount: number;
}

interface AuthorFilterProps {
  currentAuthor?: string;
  currentTag?: string;
}

export function AuthorFilter({
  currentAuthor,
  currentTag,
}: AuthorFilterProps) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch("/api/authors")
      .then((res) => res.json())
      .then((data) => setAuthors(Array.isArray(data) ? data : []));
  }, []);

  if (authors.length === 0) return null;

  function navigate(nextAuthor?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextAuthor) {
      params.set("author", nextAuthor);
    } else {
      params.delete("author");
    }
    if (currentTag) {
      params.set("tag", currentTag);
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/40 bg-background/60 px-4 py-3 backdrop-blur-sm">
      <span className="text-xs text-muted-foreground">作者</span>
      <Badge
        variant={!currentAuthor ? "default" : "outline"}
        className="cursor-pointer transition-colors"
        onClick={() => navigate()}
      >
        全部
      </Badge>
      {authors.map((author) => (
        <Badge
          key={author.username}
          variant={currentAuthor === author.username ? "default" : "outline"}
          className="cursor-pointer transition-colors"
          onClick={() => navigate(author.username)}
        >
          {author.username}
        </Badge>
      ))}
    </div>
  );
}
