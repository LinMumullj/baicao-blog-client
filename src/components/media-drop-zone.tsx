"use client";

import { useCallback, useState } from "react";
import { cn } from "cn";

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
    if (disabled) return;

    const files = filterFiles(e.dataTransfer.files);
    if (files.length === 0) return;

    onFiles(multiple ? files : files.slice(0, 1));
  }

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (e.currentTarget.contains(e.relatedTarget as Node)) return;
        setDragging(false);
      }}
      onDrop={handleDrop}
      className={cn(
        "rounded-lg transition-colors",
        dragging &&
          !disabled &&
          "ring-2 ring-ring ring-offset-2 ring-offset-background",
        className
      )}
    >
      {children}
      {dragging && !disabled && (
        <div className="pointer-events-none mt-2 rounded-md border border-dashed border-border/80 bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground">
          松开以选择图片
        </div>
      )}
    </div>
  );
}
