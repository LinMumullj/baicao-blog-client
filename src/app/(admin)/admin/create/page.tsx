"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ImagePlus, Send } from "lucide-react";
import Image from "next/image";

interface UploadedMedia {
  url: string;
  type: string;
  preview: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (media.length + files.length > 9) {
      setError("最多上传 9 张图片");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: files.map((f) => ({ name: f.name, type: f.type })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "获取上传参数失败");
        return;
      }

      const { uploads } = await res.json();

      const uploaded: UploadedMedia[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const params = uploads[i];

        const formData = new FormData();
        formData.append("key", params.key);
        formData.append("policy", params.policy);
        formData.append("OSSAccessKeyId", params.accessKeyId);
        formData.append("Signature", params.signature);
        formData.append("Content-Type", file.type);
        formData.append("file", file);

        await fetch(params.host, { method: "POST", body: formData });

        uploaded.push({
          url: params.url,
          type: file.type.startsWith("video/") ? "video" : "image",
          preview: URL.createObjectURL(file),
        });
      }

      setMedia((prev) => [...prev, ...uploaded]);
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
          mediaUrls: media.map((m) => ({ url: m.url, type: m.type })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "发布失败");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("发布失败，请重试");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold">发布动态</h1>

      <div className="space-y-4">
        {/* Text Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你的想法..."
          rows={5}
          className="w-full resize-none border border-input bg-background p-3 text-sm outline-none focus:ring-1 focus:ring-ring"
        />

        {/* Media Preview */}
        {media.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {media.map((m, i) => (
              <div key={i} className="group relative aspect-square overflow-hidden bg-muted">
                {m.type === "video" ? (
                  <video
                    src={m.preview}
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
                <button
                  onClick={() => removeMedia(i)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || media.length >= 9}
              className="flex items-center gap-1 border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4" />
              {uploading ? "上传中..." : `图片 (${media.length}/9)`}
            </button>
          </div>

          <button
            onClick={handlePublish}
            disabled={publishing || !content.trim()}
            className="flex items-center gap-1 border border-foreground bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-background hover:text-foreground disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {publishing ? "发布中..." : "发布"}
          </button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
