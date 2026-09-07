import Image from "next/image";
import { Suspense } from "react";
import { HomeContent } from "@/components/home-content";
import { PostLeaderboard } from "@/components/post-leaderboard";

interface HomePageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)]">
      {/* 全页背景 */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Image
          src="/images/hero-cover.png"
          alt="百草博客背景"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_60%]"
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Suspense
              fallback={
                <div className="h-48 rounded-xl border border-border/40 bg-background/60 backdrop-blur-md" />
              }
            >
              <PostLeaderboard />
            </Suspense>
          </aside>

          <main>
            <HomeContent tag={params.tag} />
          </main>
        </div>
      </div>
    </div>
  );
}
