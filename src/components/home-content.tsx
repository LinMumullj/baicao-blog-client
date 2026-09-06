"use client";

import { useState } from "react";
import { CreatePostForm } from "@/components/create-post-form";
import { PostFeed } from "@/components/post-feed";
import { TagFilter } from "@/components/tag-filter";
import { Badge } from "@/components/ui/badge";

interface HomeContentProps {
  tag?: string;
}

export function HomeContent({ tag }: HomeContentProps) {
  const [feedKey, setFeedKey] = useState(0);

  return (
    <div className="space-y-4">
      <CreatePostForm onSuccess={() => setFeedKey((k) => k + 1)} />

      <TagFilter currentTag={tag} />
      {tag && (
        <div className="rounded-lg border border-border/40 bg-background/60 px-4 py-3 backdrop-blur-sm">
          <span className="text-sm text-muted-foreground">筛选标签：</span>
          <Badge variant="secondary" className="ml-2">
            #{tag}
          </Badge>
        </div>
      )}
      <PostFeed tag={tag} refreshKey={feedKey} />
    </div>
  );
}
