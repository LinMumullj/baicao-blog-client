"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeletePostButtonProps {
  postId: string;
  onSuccess?: () => void;
  redirectTo?: string;
}

async function readErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return (data.error as string | undefined) || "删除失败";
  } catch {
    return "删除失败";
  }
}

export function DeletePostButton({
  postId,
  onSuccess,
  redirectTo,
}: DeletePostButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      "确定删除这条动态？关联的评论、点赞和媒体文件将一并删除。"
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });

      if (!res.ok) {
        setError(await readErrorMessage(res));
        return;
      }

      onSuccess?.();

      if (redirectTo) {
        router.push(redirectTo);
      } else if (!onSuccess) {
        router.refresh();
      }
    } catch {
      setError("删除失败，请重试");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        disabled={deleting}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
        {deleting ? "删除中..." : "删除"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
