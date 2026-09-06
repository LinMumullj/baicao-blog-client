import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { MediaGrid } from "@/components/media-grid";
import { Heart, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;

  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      media: { orderBy: { order: "asc" } },
      postTags: { include: { tag: true } },
      _count: { select: { comments: true, likes: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { id: true, username: true, avatar: true },
          },
        },
      },
    },
  });

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Back */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </Link>

      {/* Post */}
      <article>
        {/* Author */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
            {post.author.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{post.author.username}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(post.createdAt).toLocaleString("zh-CN")}
            </p>
          </div>
        </div>

        {/* Content */}
        {post.title && (
          <h1 className="mt-4 text-2xl font-bold">{post.title}</h1>
        )}
        <p className="mt-4 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>

        {/* Media */}
        <MediaGrid media={post.media} />

        {/* Tags */}
        {post.postTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.postTags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/?tag=${encodeURIComponent(tag.name)}`}
                className="border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="mt-4 flex items-center gap-6 border-t border-border pt-4 text-muted-foreground">
          <div className="flex items-center gap-1 text-sm">
            <Heart className="h-4 w-4" />
            <span>{post._count.likes} 赞</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <MessageCircle className="h-4 w-4" />
            <span>{post._count.comments} 评论</span>
          </div>
        </div>
      </article>

      {/* Comments */}
      <section className="mt-8 border-t border-border pt-6">
        <h2 className="mb-4 font-bold">评论 ({post.comments.length})</h2>
        {post.comments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            暂无评论
          </p>
        ) : (
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                  {comment.author.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium">
                      {comment.author.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString("zh-CN")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
