"use client";

import { PostFeed } from "@/components/post-feed";

interface AuthorFeedProps {
  username: string;
}

export function AuthorFeed({ username }: AuthorFeedProps) {
  return <PostFeed author={username} />;
}
