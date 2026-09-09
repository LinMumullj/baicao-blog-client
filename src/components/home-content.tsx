"use client";

import { Suspense, useState } from "react";
import { CreatePostForm } from "@/components/create-post-form";
import { PostFeed } from "@/components/post-feed";
import { TagFilter } from "@/components/tag-filter";
import { AuthorFilter } from "@/components/author-filter";
import { Badge } from "@/components/ui/badge";

interface HomeContentProps {
  tag?: string;
  author?: string;
}

export function HomeContent({ tag, author }: HomeContentProps) {
  const [feedKey, setFeedKey] = useState(0);

  return (
    <div className="space-y-4">
      <CreatePostForm onSuccess={() => setFeedKey((k) => k + 1)} />

      <Suspense fallback={null}>
        <TagFilter currentTag={tag} />
      </Suspense>
      <Suspense fallback={null}>
        <AuthorFilter currentAuthor={author} currentTag={tag} />
      </Suspense>

      {(tag || author) && (
        <div className="rounded-lg border border-border/40 bg-background/60 px-4 py-3 backdrop-blur-sm">
          <span className="text-sm text-muted-foreground">当前筛选：</span>
          {tag && (
            <Badge variant="secondary" className="ml-2">
              #{tag}
            </Badge>
          )}
          {author && (
            <Badge variant="secondary" className="ml-2">
              @{author}
            </Badge>
          )}
        </div>
      )}
      <PostFeed tag={tag} author={author} refreshKey={feedKey} />
    </div>
  );
}
