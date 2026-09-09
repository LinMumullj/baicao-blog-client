"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PostDetailView } from "@/components/post-detail-view";
import type { PostDetailData } from "@/lib/post-detail";

interface PostOverlayProps {
  post: PostDetailData;
}

export function PostOverlay({ post }: PostOverlayProps) {
  const router = useRouter();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <DialogContent className="flex h-[min(720px,88vh)] w-[min(960px,calc(100%-2rem))] max-w-[960px] flex-col overflow-hidden p-0 sm:max-w-[960px]">
        <div className="min-h-0 flex-1 overflow-hidden pr-10">
          <PostDetailView post={post} variant="overlay" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
