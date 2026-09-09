"use client";

import { useCallback, useEffect, useState } from "react";
import { cn } from "cn";

const DESKTOP_DRAG_MQ = "(min-width: 1024px)";

export function useMediaDragEnabled() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_DRAG_MQ);
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return enabled;
}

interface MediaDropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function MediaDropZone({
  onFiles,
  accept,
  multiple = false,
  disabled = false,
  className,
  children,
}: MediaDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const dragEnabled = useMediaDragEnabled();

  const filterFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (!accept) return files;

      const acceptTypes = accept.split(",").map((item) => item.trim());
      return files.filter((file) =>
        acceptTypes.some((type) => {
          if (type.endsWith("/*")) {
            return file.type.startsWith(type.replace("/*", "/"));
          }
          return file.type === type || file.name.endsWith(type);
        })
      );
    },
    [accept]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (disabled || !dragEnabled) return;

    const files = filterFiles(e.dataTransfer.files);
    if (files.length === 0) return;

    onFiles(multiple ? files : files.slice(0, 1));
  }

  const canDrag = dragEnabled && !disabled;

  return (
    <div
      onDragEnter={
        canDrag
          ? (e) => {
              e.preventDefault();
              setDragging(true);
            }
          : undefined
      }
      onDragOver={
        canDrag
          ? (e) => {
              e.preventDefault();
              setDragging(true);
            }
          : undefined
      }
      onDragLeave={
        canDrag
          ? (e) => {
              e.preventDefault();
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              setDragging(false);
            }
          : undefined
      }
      onDrop={canDrag ? handleDrop : undefined}
      className={cn(
        "rounded-lg transition-colors",
        dragging && canDrag && "ring-2 ring-ring ring-offset-2 ring-offset-background",
        className
      )}
    >
      {children}
      {dragging && canDrag && (
        <div className="pointer-events-none mt-2 rounded-md border border-dashed border-border/80 bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
          松开以选择图片
        </div>
      )}
    </div>
  );
}
