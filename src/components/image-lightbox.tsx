"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LightboxImage {
  url: string;
  alt?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

export function ImageLightbox({
  images,
  index,
  onIndexChange,
}: ImageLightboxProps) {
  const open = index !== null && images.length > 0;
  const current = index ?? 0;
  const hasMultiple = images.length > 1;

  const showPrev = useCallback(() => {
    onIndexChange((current - 1 + images.length) % images.length);
  }, [current, images.length, onIndexChange]);

  const showNext = useCallback(() => {
    onIndexChange((current + 1) % images.length);
  }, [current, images.length, onIndexChange]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onIndexChange(null);
        return;
      }

      if (e.key === "ArrowLeft" && hasMultiple) {
        e.preventDefault();
        e.stopPropagation();
        showPrev();
        return;
      }

      if (e.key === "ArrowRight" && hasMultiple) {
        e.preventDefault();
        e.stopPropagation();
        showNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [open, hasMultiple, onIndexChange, showPrev, showNext]);

  if (!open) return null;

  const image = images[current];

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onIndexChange(null);
      }}
    >
      <DialogContent
        overlayClassName="z-[100] bg-black/85"
        className="z-[100] flex max-h-[92vh] w-[min(960px,calc(100%-2rem))] max-w-[960px] flex-col items-center gap-3 border-border/40 bg-black/95 p-4 sm:max-w-[960px] sm:p-6 [&>button:last-child]:text-white/80 [&>button:last-child]:hover:text-white"
      >
        <div className="relative flex h-[min(72vh,720px)] w-full items-center justify-center">
          <Image
            src={image.url}
            alt={image.alt ?? `图片 ${current + 1}`}
            width={1600}
            height={1200}
            className="max-h-full max-w-full object-contain"
            sizes="(max-width: 960px) 100vw, 960px"
            priority
          />

          {hasMultiple && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  showPrev();
                }}
                aria-label="上一张"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  showNext();
                }}
                aria-label="下一张"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {hasMultiple && (
          <p className="text-sm text-white/70">
            {current + 1} / {images.length}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
