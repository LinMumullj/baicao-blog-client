"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageLightbox } from "@/components/image-lightbox";

interface MediaItem {
  id: string;
  url: string;
  type: string;
  order: number;
}

interface MediaGridProps {
  media: MediaItem[];
  onImageClick?: (index: number) => void;
  variant?: "default" | "overlay";
  lightbox?: boolean;
}

export function MediaGrid({
  media,
  onImageClick,
  variant = "default",
  lightbox = true,
}: MediaGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (media.length === 0) return null;

  const isOverlay = variant === "overlay";
  const images = media.filter((m) => m.type === "image");
  const video = media.find((m) => m.type === "video");

  function handleImagePointerDown(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleImageClick(index: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (onImageClick) {
      onImageClick(index);
      return;
    }

    if (lightbox) {
      setLightboxIndex(index);
    }
  }

  const lightboxImages = images.map((img, i) => ({
    url: img.url,
    alt: `图片 ${i + 1}`,
  }));

  if (video) {
    return (
      <div
        className={cn(
          "overflow-hidden",
          isOverlay
            ? "flex h-full w-full items-center justify-center p-3"
            : "mt-3 rounded-sm"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <video
          src={video.url}
          controls
          className={cn(
            "bg-muted object-contain",
            isOverlay ? "max-h-full max-w-full" : "max-h-96 w-full"
          )}
          preload="metadata"
        />
      </div>
    );
  }

  if (images.length === 0) return null;

  const count = images.length;

  const grid = count === 1 ? (
    <div
      className={cn(
        "cursor-zoom-in overflow-hidden bg-muted",
        isOverlay
          ? "flex h-full w-full items-center justify-center p-3"
          : "mt-3 rounded-sm"
      )}
      onPointerDown={handleImagePointerDown}
      onClick={(e) => handleImageClick(0, e)}
    >
      {isOverlay ? (
        <div className="relative aspect-[4/3] w-full max-md:max-h-[38vh] md:h-full md:min-h-[220px]">
          <Image
            src={images[0].url}
            alt="图片"
            fill
            className="object-contain"
            sizes="480px"
          />
        </div>
      ) : (
        <Image
          src={images[0].url}
          alt="图片"
          width={1200}
          height={900}
          className="max-h-96 w-full object-contain"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      )}
    </div>
  ) : (
    <div
      className={cn(
        "grid gap-1 overflow-hidden",
        isOverlay ? "h-full w-full content-center p-3" : "mt-3 rounded-sm",
        count === 2 && "grid-cols-2",
        count >= 3 && "grid-cols-3"
      )}
    >
      {images.map((img, index) => (
        <div
          key={img.id}
          className="relative aspect-square cursor-zoom-in overflow-hidden bg-muted"
          onPointerDown={handleImagePointerDown}
          onClick={(e) => handleImageClick(index, e)}
        >
          <Image
            src={img.url}
            alt={`图片 ${index + 1}`}
            fill
            className="object-cover transition-opacity hover:opacity-90"
            sizes={count === 2 ? "240px" : "160px"}
          />
        </div>
      ))}
    </div>
  );

  return (
    <>
      {grid}
      {lightbox && (
        <ImageLightbox
          images={lightboxImages}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
        />
      )}
    </>
  );
}
