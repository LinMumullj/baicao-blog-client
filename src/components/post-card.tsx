import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { MediaGrid } from "@/components/media-grid";
import { UserAvatar } from "@/components/user-avatar";
import { LikeButton } from "@/components/like-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    title?: string | null;
    isLongPost: boolean;
    createdAt: string;
    isLiked?: boolean;
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
  const postHref = `/post/${post.id}`;
  const displayContent =
    post.isLongPost && post.content.length > 200
      ? post.content.slice(0, 200) + "..."
      : post.content;

  return (
    <Card className="gap-0 rounded-xl border-border/40 bg-background/80 py-0 shadow-sm backdrop-blur-md transition-colors hover:bg-background/90">
      <CardContent className="px-4 py-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href={`/user/${encodeURIComponent(post.author.username)}`}
            className="shrink-0 rounded-full transition-opacity hover:opacity-80"
          >
            <UserAvatar
              username={post.author.username}
              avatar={post.author.avatar}
            />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={`/user/${encodeURIComponent(post.author.username)}`}
              className="text-sm font-medium hover:underline"
            >
              {post.author.username}
            </Link>
            <span className="ml-2 text-xs text-muted-foreground">
              {formatTime(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Content */}
        <Link
          href={postHref}
          className="mt-3 block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {post.title && (
            <h2 className="text-lg font-semibold tracking-tight">{post.title}</h2>
          )}
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {displayContent}
          </p>
          {post.isLongPost && post.content.length > 200 && (
            <span className="mt-1 inline-block text-sm text-muted-foreground">
              查看全文 →
            </span>
          )}
        </Link>

        {/* Media: outside Link so lightbox does not trigger post navigation */}
        <MediaGrid media={post.media} />

        {/* Tags */}
        {post.postTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.postTags.map(({ tag }) => (
              <Badge key={tag.id} variant="secondary" asChild>
                <Link href={`/?tag=${encodeURIComponent(tag.name)}`}>
                  #{tag.name}
                </Link>
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <LikeButton
            postId={post.id}
            initialLikeCount={post._count.likes}
            initialIsLiked={post.isLiked ?? false}
          />
          <Link
            href={postHref}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            {post._count.comments > 0 && post._count.comments}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
