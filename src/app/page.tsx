import Image from "next/image";
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
      <section className="relative flex h-[60vh] flex-col items-center justify-center overflow-hidden">
        <Image
          src="/images/hero-cover.png"
          alt="百草博客封面 — 奶牛猫"
          fill
          priority
          className="object-cover object-[center_60%]"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            百草
          </h1>
          <p className="mt-2 text-white/80">记录生活，分享日常</p>
        </div>
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
