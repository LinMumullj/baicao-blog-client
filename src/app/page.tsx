import { Cat } from "lucide-react";
import { PostFeed } from "@/components/post-feed";
import { TagFilter } from "@/components/tag-filter";

interface HomePageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex h-[60vh] flex-col items-center justify-center overflow-hidden bg-muted">
        <Cat className="mb-4 h-24 w-24 text-foreground" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          百草
        </h1>
        <p className="mt-2 text-muted-foreground">记录生活，分享日常</p>
      </section>

      {/* Feed Section */}
      <section className="mx-auto max-w-3xl">
        <TagFilter currentTag={params.tag} />
        {params.tag && (
          <div className="border-b border-border px-4 py-3">
            <span className="text-sm text-muted-foreground">
              筛选标签：
            </span>
            <span className="ml-1 text-sm font-medium">#{params.tag}</span>
          </div>
        )}
        <PostFeed tag={params.tag} />
      </section>
    </div>
  );
}
