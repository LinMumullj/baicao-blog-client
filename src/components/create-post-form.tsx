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

type MediaMode = "image" | "video";

interface UploadedMedia {
  url: string;
  type: string;
  preview: string;
}

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [uploading, setUploading] = useState(false);
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

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (mediaMode === "image" && media.length + files.length > 9) {
      setError("最多上传 9 张图片");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "上传失败");
        return;
      }

      const { uploads } = await res.json();

      const uploaded: UploadedMedia[] = uploads.map(
        (item: { url: string; type: string }, i: number) => ({
          url: item.url,
          type: item.type,
          preview: URL.createObjectURL(files[i]),
        })
      );

      if (mediaMode === "video") {
        setMedia(uploaded.slice(0, 1));
      } else {
        setMedia((prev) => [...prev, ...uploaded]);
      }
    } catch {
      setError("上传失败，请重试");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeMedia(index: number) {
    setMedia((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[index].preview);
      next.splice(index, 1);
      return next;
    });
  }

  async function handlePublish() {
    if (!content.trim()) {
      setError("请输入内容");
      return;
    }

    setPublishing(true);
    setError("");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          ...(isLongPost
            ? { title: title.trim() || undefined, isLongPost: true }
            : {}),
          mediaUrls: media.map((m) => ({ url: m.url, type: m.type })),
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
    } catch {
      setError("发布失败，请重试");
    } finally {
      setPublishing(false);
    }
  }

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

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你的想法..."
          rows={isLongPost ? 8 : 4}
          className="resize-none bg-background/60"
        />

        {media.length > 0 && (
          <div
            className={mediaMode === "video" ? "" : "grid grid-cols-3 gap-2"}
          >
            {media.map((m, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden rounded-lg bg-muted ${
                  mediaMode === "video"
                    ? "aspect-video w-full"
                    : "aspect-square"
                }`}
              >
                {m.type === "video" ? (
                  <video
                    src={m.preview}
                    controls
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={m.preview}
                    alt={`预览 ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-xs"
                  onClick={() => removeMedia(i)}
                  className="absolute right-1.5 top-1.5 bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
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
            >
              <ImagePlus className="h-4 w-4" />
              图片
            </Button>
            <Button
              type="button"
              variant={mediaMode === "video" ? "default" : "outline"}
              size="sm"
              onClick={() => switchMediaMode("video")}
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
                uploading ||
                (mediaMode === "image" && media.length >= 9) ||
                (mediaMode === "video" && media.length >= 1)
              }
            >
              {uploading
                ? "上传中..."
                : mediaMode === "image"
                  ? `上传 (${media.length}/9)`
                  : media.length > 0
                    ? "已上传视频"
                    : "上传视频"}
            </Button>
          </div>

          <Button
            onClick={handlePublish}
            disabled={publishing || !content.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
            {publishing ? "发布中..." : "发布"}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
