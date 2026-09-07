import { Cat } from "lucide-react";

export function CatLoader({ label = "加载中..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Cat className="h-10 w-10 animate-pulse text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
