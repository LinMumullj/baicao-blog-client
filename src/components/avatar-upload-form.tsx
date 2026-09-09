"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { MediaDropZone } from "@/components/media-drop-zone";

export function AvatarUploadForm() {
  const { data: session, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  if (!session?.user) return null;

  async function uploadAvatar(file: File) {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("files", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        setError(data.error || "上传失败");
        return;
      }

      const { uploads } = await uploadRes.json();
      const avatarUrl = uploads[0]?.url;

      const res = await fetch("/api/users/avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "更新头像失败");
        return;
      }

      const data = await res.json();
      await update({ avatar: data.avatar });
    } catch {
      setError("上传失败，请重试");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAvatar(file);
  }

  return (
    <Card className="border-border/60 shadow-lg">
      <CardHeader>
        <CardTitle>个人设置</CardTitle>
        <CardDescription>上传头像，在评论和导航栏中展示</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 sm:flex-row">
        <MediaDropZone
          onFiles={(files) => {
            if (files[0]) uploadAvatar(files[0]);
          }}
          accept="image/*"
          disabled={uploading}
          className="flex flex-col items-center gap-4 sm:flex-row"
        >
          <UserAvatar
            username={session.user.name ?? "?"}
            avatar={session.user.avatar}
            size="lg"
          />
          <div className="space-y-2 text-center sm:text-left">
            <p className="text-xs text-muted-foreground">
              拖拽图片到头像区域上传
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4" />
              {uploading ? "上传中..." : "更换头像"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </MediaDropZone>
      </CardContent>
    </Card>
  );
}
