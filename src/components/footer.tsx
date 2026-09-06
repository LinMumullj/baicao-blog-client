import { Cat } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
        <Cat className="h-5 w-5 opacity-60" />
        <p>© {new Date().getFullYear()} 百草 Baicao Blog</p>
      </div>
    </footer>
  );
}
