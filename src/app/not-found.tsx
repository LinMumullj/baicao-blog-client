import Link from "next/link";
import { Cat } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
      <Cat className="mb-6 h-24 w-24 text-muted-foreground" />
      <h1 className="text-2xl font-bold">这只猫迷路了</h1>
      <p className="mt-2 text-muted-foreground">你访问的页面不存在</p>
      <Button asChild className="mt-6">
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
