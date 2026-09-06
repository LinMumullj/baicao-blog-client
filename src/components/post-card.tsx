import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { MediaGrid } from "@/components/media-grid";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    title?: string | null;
    isLongPost: boolean;
    createdAt: string;
    author: {
      id: string;
      username: string;
      avatar?: string | null;
    };
    media: {
      id: string;
      url: string;
      type: string;
      order: number;
    }[];
    postTags: {
      tag: { id: string; name: string };
    }[];
    _count: {
      comments: number;
      likes: number;
    };
  };
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return date.toLocaleDateString("zh-CN");
}

export function PostCard({ post }: PostCardProps) {
  const displayContent =
    post.isLongPost && post.content.length > 200
      ? post.content.slice(0, 200) + "..."
      : post.content;

  return (
    <article className="border-b border-border px-4 py-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold">
          {post.author.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium">{post.author.username}</span>
          <span className="ml-2 text-xs text-muted-foreground">
            {formatTime(post.createdAt)}
          </span>
        </div>
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`} className="block">
        {post.title && (
          <h2 className="mt-3 text-lg font-bold">{post.title}</h2>
        )}
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
          {displayContent}
        </p>
        {post.isLongPost && post.content.length > 200 && (
          <span className="text-sm text-muted-foreground">查看全文</span>
        )}
      </Link>

      {/* Media */}
      <MediaGrid media={post.media} />

      {/* Tags */}
      {post.postTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {post.postTags.map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/?tag=${encodeURIComponent(tag.name)}`}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center gap-6 text-muted-foreground">
        <Link
          href={`/post/${post.id}`}
          className="flex items-center gap-1 text-xs transition-colors hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          {post._count.comments > 0 && post._count.comments}
        </Link>
        <div className="flex items-center gap-1 text-xs">
          <Heart className="h-4 w-4" />
          {post._count.likes > 0 && post._count.likes}
        </div>
      </div>
    </article>
  );
}
