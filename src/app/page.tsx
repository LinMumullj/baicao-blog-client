import { Cat } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex h-[60vh] flex-col items-center justify-center overflow-hidden bg-muted">
        <Cat className="mb-4 h-24 w-24 text-foreground" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          百草
        </h1>
        <p className="mt-2 text-muted-foreground">
          记录生活，分享日常
        </p>
      </section>

      {/* Feed Section */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Cat className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">还没有动态</p>
          <p className="mt-1 text-sm text-muted-foreground">
            等管理员发布第一条动态吧 🐾
          </p>
        </div>
      </section>
    </div>
  );
}
