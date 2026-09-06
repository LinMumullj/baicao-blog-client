"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  url: string;
  type: string;
  order: number;
}

interface MediaGridProps {
  media: MediaItem[];
  onImageClick?: (index: number) => void;
}

export function MediaGrid({ media, onImageClick }: MediaGridProps) {
  if (media.length === 0) return null;

  const images = media.filter((m) => m.type === "image");
  const video = media.find((m) => m.type === "video");

  if (video) {
    return (
      <div className="mt-3 overflow-hidden rounded-sm">
        <video
          src={video.url}
          controls
          className="w-full max-h-96 bg-muted object-contain"
          preload="metadata"
        />
      </div>
    );
  }

  if (images.length === 0) return null;

  const count = images.length;

  const gridClass = cn(
    "mt-3 grid gap-1 overflow-hidden rounded-sm",
    count === 1 && "grid-cols-1",
    count === 2 && "grid-cols-2",
    count >= 3 && "grid-cols-3"
  );

  return (
    <div className={gridClass}>
      {images.map((img, index) => (
        <div
          key={img.id}
          className={cn(
            "relative aspect-square cursor-pointer overflow-hidden bg-muted",
            count === 1 && "aspect-auto max-h-96"
          )}
          onClick={() => onImageClick?.(index)}
        >
          <Image
            src={img.url}
            alt={`图片 ${index + 1}`}
            fill
            className={cn(
              "object-cover transition-opacity hover:opacity-90",
              count === 1 && "object-contain"
            )}
            sizes={
              count === 1
                ? "100vw"
                : count === 2
                  ? "50vw"
                  : "33vw"
            }
          />
        </div>
      ))}
    </div>
  );
}
