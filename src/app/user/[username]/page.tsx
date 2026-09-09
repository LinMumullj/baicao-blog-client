import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { decodeRouteParam } from "@/lib/route-params";
import { UserAvatar } from "@/components/user-avatar";
import { AuthorFeed } from "@/components/author-feed";

interface AuthorPageProps {
  params: Promise<{ username: string }>;
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { username: rawUsername } = await params;
  const username = decodeRouteParam(rawUsername);

  const author = await db.user.findUnique({
    where: { username },
    select: {
      username: true,
      avatar: true,
      _count: { select: { posts: true } },
    },
  });

  if (!author) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center gap-4 rounded-xl border border-border/40 bg-background/80 p-5 backdrop-blur-md">
        <UserAvatar
          username={author.username}
          avatar={author.avatar}
          size="lg"
        />
        <div>
          <h1 className="text-xl font-semibold">{author.username}</h1>
          <p className="text-sm text-muted-foreground">
            {author._count.posts} 条动态
          </p>
        </div>
      </div>

      <AuthorFeed username={author.username} />
    </div>
  );
}
