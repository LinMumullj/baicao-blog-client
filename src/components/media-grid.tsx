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

  if (count === 1) {
    const img = images[0];
    return (
      <div
        className="mt-3 cursor-pointer overflow-hidden rounded-sm bg-muted"
        onClick={() => onImageClick?.(0)}
      >
        <Image
          src={img.url}
          alt="图片"
          width={1200}
          height={900}
          className="max-h-96 w-full object-contain"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>
    );
  }

  const gridClass = cn(
    "mt-3 grid gap-1 overflow-hidden rounded-sm",
    count === 2 && "grid-cols-2",
    count >= 3 && "grid-cols-3"
  );

  return (
    <div className={gridClass}>
      {images.map((img, index) => (
        <div
          key={img.id}
          className="relative aspect-square cursor-pointer overflow-hidden bg-muted"
          onClick={() => onImageClick?.(index)}
        >
          <Image
            src={img.url}
            alt={`图片 ${index + 1}`}
            fill
            className="object-cover transition-opacity hover:opacity-90"
            sizes={count === 2 ? "50vw" : "33vw"}
          />
        </div>
      ))}
    </div>
  );
}
