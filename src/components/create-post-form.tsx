"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ImagePlus, Video, Send } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MediaDropZone } from "@/components/media-drop-zone";
import { EmojiPicker, insertAtCursor } from "@/components/emoji-picker";
import { validateUploadFileSize } from "@/lib/upload-limits";

type MediaMode = "image" | "video";

interface PendingMedia {
  file: File;
  preview: string;
  type: "image" | "video";
}

interface CreatePostFormProps {
  onSuccess?: () => void;
}

function mediaTypeFromFile(file: File): "image" | "video" {
  return file.type.startsWith("video/") ? "video" : "image";
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<PendingMedia[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [mediaMode, setMediaMode] = useState<MediaMode>("image");
  const [isLongPost, setIsLongPost] = useState(false);
  const [title, setTitle] = useState("");

  function switchMediaMode(mode: MediaMode) {
    if (mode === mediaMode) return;
    media.forEach((m) => URL.revokeObjectURL(m.preview));
    setMedia([]);
    setMediaMode(mode);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetForm() {
    setContent("");
    setTitle("");
    setIsLongPost(false);
    media.forEach((m) => URL.revokeObjectURL(m.preview));
    setMedia([]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function addFiles(files: File[]) {
    if (files.length === 0) return;

    if (mediaMode === "image" && media.length + files.length > 9) {
      setError("最多选择 9 张图片");
      return;
    }

    for (const file of files) {
      const sizeError = validateUploadFileSize(file);
      if (sizeError) {
        setError(sizeError);
        return;
      }
    }

    setError("");

    const pending: PendingMedia[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: mediaTypeFromFile(file),
    }));

    if (mediaMode === "video") {
      media.forEach((m) => URL.revokeObjectURL(m.preview));
      setMedia(pending.slice(0, 1));
    } else {
      setMedia((prev) => [...prev, ...pending]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files || []));
  }

  function handleEmojiSelect(emoji: string) {
    const textarea = contentRef.current;
    if (!textarea) {
      setContent((value) => value + emoji);
      return;
    }

    const { nextValue, nextCursor } = insertAtCursor(
      content,
      emoji,
      textarea.selectionStart,
      textarea.selectionEnd
    );
    setContent(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function removeMedia(index: number) {
    setMedia((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  }

  async function uploadMediaToOSS() {
    const formData = new FormData();
    media.forEach((item) => formData.append("files", item.file));

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "上传失败");
    }

    const { uploads } = await res.json();
    return uploads as { url: string; type: string }[];
  }

  async function handlePublish() {
    if (!content.trim()) {
      setError("请输入内容");
      return;
    }

    setPublishing(true);
    setError("");

    try {
      const mediaUrls = media.length > 0 ? await uploadMediaToOSS() : [];

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          ...(isLongPost
            ? { title: title.trim() || undefined, isLongPost: true }
            : {}),
          mediaUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "发布失败");
        return;
      }

      resetForm();
      onSuccess?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "发布失败，请重试");
    } finally {
      setPublishing(false);
    }
  }

  const publishLabel =
    publishing && media.length > 0 ? "上传并发布中..." : publishing ? "发布中..." : "发布";

  return (
    <Card className="border-border/40 bg-background/80 shadow-lg backdrop-blur-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">发布动态</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="longPost"
            checked={isLongPost}
            onCheckedChange={(checked) => {
              setIsLongPost(checked === true);
              if (!checked) setTitle("");
            }}
          />
          <Label htmlFor="longPost" className="cursor-pointer font-normal">
            长文模式
          </Label>
        </div>

        {isLongPost && (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入标题"
            className="bg-background/60"
          />
        )}

        <div className="space-y-2">
          <Textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享你的想法..."
            rows={isLongPost ? 8 : 4}
            className="resize-none bg-background/60"
          />
          <div className="flex justify-end">
            <EmojiPicker onSelect={handleEmojiSelect} disabled={publishing} />
          </div>
        </div>

        {mediaMode === "image" ? (
          <MediaDropZone
            onFiles={addFiles}
            accept="image/*"
            multiple
            disabled={publishing || media.length >= 9}
          >
            {media.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {media.map((m, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
                  >
                    <Image
                      src={m.preview}
                      alt={`预览 ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-xs"
                      onClick={() => removeMedia(i)}
                      disabled={publishing}
                      className="absolute right-1.5 top-1.5 bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 bg-background/40 px-4 py-8 text-center text-sm text-muted-foreground">
                拖拽图片到此处，发布时再上传
              </div>
            )}
          </MediaDropZone>
        ) : (
          media.length > 0 && (
            <div>
              {media.map((m, i) => (
                <div
                  key={i}
                  className="group relative aspect-video w-full overflow-hidden rounded-lg bg-muted"
                >
                  <video
                    src={m.preview}
                    controls
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon-xs"
                    onClick={() => removeMedia(i)}
                    disabled={publishing}
                    className="absolute right-1.5 top-1.5 bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )
        )}

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={mediaMode === "video" ? "video/*" : "image/*"}
              multiple={mediaMode === "image"}
              className="hidden"
              onChange={handleFileSelect}
            />

            <Button
              type="button"
              variant={mediaMode === "image" ? "default" : "outline"}
              size="sm"
              onClick={() => switchMediaMode("image")}
              disabled={publishing}
            >
              <ImagePlus className="h-4 w-4" />
              图片
            </Button>
            <Button
              type="button"
              variant={mediaMode === "video" ? "default" : "outline"}
              size="sm"
              onClick={() => switchMediaMode("video")}
              disabled={publishing}
            >
              <Video className="h-4 w-4" />
              视频
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={
                publishing ||
                (mediaMode === "image" && media.length >= 9) ||
                (mediaMode === "video" && media.length >= 1)
              }
            >
              {mediaMode === "image"
                ? `选择图片 (${media.length}/9)`
                : media.length > 0
                  ? "已选择视频"
                  : "选择视频"}
            </Button>
          </div>

          <Button
            onClick={handlePublish}
            disabled={publishing || !content.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
            {publishLabel}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
