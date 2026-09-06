import { Cat } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Cat className="h-6 w-6" />
          <span className="text-lg font-bold tracking-tight">百草</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link
            href="/login"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="border border-foreground px-3 py-1.5 text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            注册
          </Link>
        </div>
      </nav>
    </header>
  );
}
