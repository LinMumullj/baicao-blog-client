"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PostDetailView } from "@/components/post-detail-view";
import { Button } from "@/components/ui/button";
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
      <DialogContent
        closeClassName="max-md:hidden"
        className="flex h-[min(720px,88vh)] w-[min(960px,calc(100%-2rem))] max-w-[960px] flex-col overflow-hidden p-0 sm:max-w-[960px] max-md:fixed max-md:inset-0 max-md:h-[100dvh] max-md:max-h-[100dvh] max-md:w-full max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-none"
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-3 left-3 z-10 md:hidden"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain max-md:pt-12 md:flex md:flex-col md:overflow-hidden md:pr-10">
          <PostDetailView post={post} variant="overlay" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
