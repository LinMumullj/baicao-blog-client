import { db } from "@/lib/db";

export type PostDetailData = {
  id: string;
  content: string;
  title: string | null;
  isLongPost: boolean;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatar: string | null;
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
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
};

export async function fetchPostDetail(
  id: string,
  userId?: string | null
): Promise<PostDetailData | null> {
  const post = await db.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, avatar: true } },
      media: { orderBy: { order: "asc" } },
      postTags: { include: { tag: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  if (!post) return null;

  let isLiked = false;
  if (userId) {
    const like = await db.like.findUnique({
      where: {
        userId_postId: { userId, postId: id },
      },
    });
    isLiked = !!like;
  }

  return {
    id: post.id,
    content: post.content,
    title: post.title,
    isLongPost: post.isLongPost,
    createdAt: post.createdAt.toISOString(),
    author: post.author,
    media: post.media,
    postTags: post.postTags,
    commentCount: post._count.comments,
    likeCount: post._count.likes,
    isLiked,
  };
}
