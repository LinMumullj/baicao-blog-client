"use client";

import { Cat, LogOut, Menu, Settings, Shield } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";

export function Navbar() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-opacity hover:opacity-80"
        >
          <Cat className="h-6 w-6" />
          <span className="text-lg font-bold tracking-tight">BAICAO</span>
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          {status === "loading" ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : session?.user ? (
            <>
              {isAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/posts">
                    <Shield className="h-4 w-4" />
                    管理
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                  设置
                </Link>
              </Button>
              <div className="flex items-center gap-2 pl-1">
                <UserAvatar
                  username={session.user.name ?? "?"}
                  avatar={session.user.avatar}
                  size="sm"
                />
                <span className="text-sm text-muted-foreground">
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

        <Button
          variant="ghost"
          size="icon-sm"
          className="sm:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="菜单"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </nav>

      {menuOpen && session?.user && (
        <div className="border-t border-border/40 bg-background/95 px-4 py-3 sm:hidden">
          <div className="flex items-center gap-3 pb-3">
            <UserAvatar
              username={session.user.name ?? "?"}
              avatar={session.user.avatar}
            />
            <span className="text-sm font-medium">{session.user.name}</span>
          </div>
          <div className="flex flex-col gap-2">
            {isAdmin && (
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/posts" onClick={() => setMenuOpen(false)}>
                  动态管理
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings" onClick={() => setMenuOpen(false)}>
                个人设置
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              登出
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
