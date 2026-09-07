"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { TagInput } from "@/components/tag-input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EditPostFormProps {
  post: {
    id: string;
    content: string;
    title: string | null;
    isLongPost: boolean;
    postTags: { tag: { name: string } }[];
  };
}

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const [content, setContent] = useState(post.content);
  const [title, setTitle] = useState(post.title ?? "");
  const [isLongPost, setIsLongPost] = useState(post.isLongPost);
  const [tags, setTags] = useState(
    post.postTags.map(({ tag }) => tag.name)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!content.trim()) {
      setError("请输入内容");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          title: isLongPost ? title.trim() : undefined,
          isLongPost,
          tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "保存失败");
        return;
      }

      router.push("/admin/posts");
      router.refresh();
    } catch {
      setError("保存失败，请重试");
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
