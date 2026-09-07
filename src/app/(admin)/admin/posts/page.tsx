import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DeletePostButton } from "@/components/delete-post-button";
import { ArrowLeft, Pencil } from "lucide-react";

export default async function AdminPostsPage() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      postTags: { include: { tag: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
        </Button>
        <h1 className="text-xl font-bold">动态管理</h1>
        <div className="w-20" />
      </div>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">暂无动态</p>
        ) : (
          posts.map((post) => {
            const summary =
              post.content.length > 80
                ? post.content.slice(0, 80) + "..."
                : post.content;

            return (
              <Card key={post.id} className="border-border/60">
                <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    {post.title && (
                      <p className="font-medium">{post.title}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{summary}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(post.createdAt).toLocaleString("zh-CN")}
                      </span>
                      <span>{post._count.likes} 赞</span>
                      <span>{post._count.comments} 评论</span>
                      {post.postTags.map(({ tag }) => (
                        <Badge key={tag.id} variant="secondary">
                          #{tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/posts/${post.id}/edit`}>
                        <Pencil className="h-4 w-4" />
                        编辑
                      </Link>
                    </Button>
                    <DeletePostButton postId={post.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
