"use client";

import { Cat, LogOut } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
        >
          <Cat className="h-6 w-6" />
          <span className="text-lg font-bold tracking-tight">百草</span>
        </Link>

        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : session?.user ? (
            <>
              <div className="flex items-center gap-2 pl-1">
                <UserAvatar
                  username={session.user.name ?? "?"}
                  size="sm"
                />
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {session.user.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                aria-label="登出"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">注册</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
