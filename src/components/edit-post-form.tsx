"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Send, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TagInput } from "@/components/tag-input";
import { MediaDropZone } from "@/components/media-drop-zone";
import { validateUploadFileSize } from "@/lib/upload-limits";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MediaItem =
  | { source: "existing"; url: string; type: string }
  | {
      source: "pending";
      file: File;
      preview: string;
      type: "image" | "video";
    };

interface EditPostFormProps {
  post: {
    id: string;
    content: string;
    title: string | null;
    isLongPost: boolean;
    media: { id: string; url: string; type: string; order: number }[];
    postTags: { tag: { name: string } }[];
  };
  successHref?: string;
}

function mediaTypeFromFile(file: File): "image" | "video" {
  return file.type.startsWith("video/") ? "video" : "image";
}

export function EditPostForm({ post, successHref }: EditPostFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState(post.content);
  const [title, setTitle] = useState(post.title ?? "");
  const [isLongPost, setIsLongPost] = useState(post.isLongPost);
  const [tags, setTags] = useState(
    post.postTags.map(({ tag }) => tag.name)
  );
  const [media, setMedia] = useState<MediaItem[]>(
    post.media.map((item) => ({
      source: "existing",
      url: item.url,
      type: item.type,
    }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isVideoPost = media.some(
    (item) => item.type === "video" || item.type.startsWith("video")
  );

  function addFiles(files: File[]) {
    if (files.length === 0) return;

    for (const file of files) {
      const sizeError = validateUploadFileSize(file);
      if (sizeError) {
        setError(sizeError);
        return;
      }
    }

    const pending = files.map((file) => ({
      source: "pending" as const,
      file,
      preview: URL.createObjectURL(file),
      type: mediaTypeFromFile(file),
    }));

    if (isVideoPost || pending.some((item) => item.type === "video")) {
      media.forEach((item) => {
        if (item.source === "pending") URL.revokeObjectURL(item.preview);
      });
      setMedia(pending.slice(0, 1));
    } else if (media.length + pending.length > 9) {
      setError("最多选择 9 张图片");
      return;
    } else {
      setMedia((prev) => [...prev, ...pending]);
    }

    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeMedia(index: number) {
    setMedia((prev) => {
      const next = [...prev];
      const removed = next[index];
      if (removed?.source === "pending") {
        URL.revokeObjectURL(removed.preview);
      }
      next.splice(index, 1);
      return next;
    });
  }

  async function uploadPendingMedia(items: Extract<MediaItem, { source: "pending" }>[]) {
    if (items.length === 0) return [];

    const formData = new FormData();
    items.forEach((item) => formData.append("files", item.file));

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

  async function handleSave() {
    if (!content.trim()) {
      setError("请输入内容");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const pendingItems = media.filter(
        (item): item is Extract<MediaItem, { source: "pending" }> =>
          item.source === "pending"
      );
      const uploaded = await uploadPendingMedia(pendingItems);
      const existingItems = media.filter((item) => item.source === "existing");

      const mediaUrls = [
        ...existingItems.map((item) => ({ url: item.url, type: item.type })),
        ...uploaded,
      ];

      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          title: isLongPost ? title.trim() : undefined,
          isLongPost,
          tags,
          mediaUrls,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "保存失败");
        return;
      }

      router.push(successHref ?? `/post/${post.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader>
        <CardTitle>编辑动态</CardTitle>
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
          />
        )}

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={isLongPost ? 10 : 6}
          className="resize-none"
        />

        <div className="space-y-2">
          <Label>媒体</Label>
          <MediaDropZone
            onFiles={addFiles}
            accept={isVideoPost ? "video/*" : "image/*"}
            multiple={!isVideoPost}
            disabled={saving || (!isVideoPost && media.length >= 9)}
          >
            {media.length > 0 ? (
              <div
                className={
                  isVideoPost
                    ? "space-y-2"
                    : "grid grid-cols-3 gap-2"
                }
              >
                {media.map((item, index) => (
                  <div
                    key={`${item.source}-${index}`}
                    className={
                      isVideoPost
                        ? "group relative aspect-video overflow-hidden rounded-lg bg-muted"
                        : "group relative aspect-square overflow-hidden rounded-lg bg-muted"
                    }
                  >
                    {item.source === "existing" ? (
                      item.type.startsWith("video") ? (
                        <video
                          src={item.url}
                          controls
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image
                          src={item.url}
                          alt={`媒体 ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="160px"
                        />
                      )
                    ) : item.type === "video" ? (
                      <video
                        src={item.preview}
                        controls
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={item.preview}
                        alt={`预览 ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-xs"
                      onClick={() => removeMedia(index)}
                      disabled={saving}
                      className="absolute right-1.5 top-1.5 bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
                <span className="hidden lg:inline">拖拽图片到此处，保存时再上传新文件</span>
                <span className="lg:hidden">点击下方按钮选择图片</span>
              </div>
            )}
          </MediaDropZone>

          {!isVideoPost && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(Array.from(e.target.files || []))}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving || media.length >= 9}
              >
                <ImagePlus className="h-4 w-4" />
                添加图片 ({media.length}/9)
              </Button>
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label>标签</Label>
          <TagInput value={tags} onChange={setTags} />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Send className="h-4 w-4" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
