import { db } from "@/lib/db";
import { UserAvatar } from "@/components/user-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function PostLeaderboard() {
  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      avatar: true,
      _count: { select: { posts: true } },
    },
    orderBy: { posts: { _count: "desc" } },
    take: 10,
  });

  const ranked = users.filter((u) => u._count.posts > 0);

  return (
    <Card className="border-border/40 bg-background/80 shadow-lg backdrop-blur-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">发帖排行</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ranked.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无数据</p>
        ) : (
          ranked.map((user, index) => (
            <div key={user.id} className="flex items-center gap-3">
              <span className="w-5 text-center text-sm font-medium text-muted-foreground">
                {index + 1}
              </span>
              <UserAvatar username={user.username} avatar={user.avatar} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground">
                  {user._count.posts} 篇
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
