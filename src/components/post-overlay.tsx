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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-6 sm:max-w-2xl">
        <PostDetailView post={post} variant="overlay" />
      </DialogContent>
    </Dialog>
  );
}
