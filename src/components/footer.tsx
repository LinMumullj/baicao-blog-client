import { Cat } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-4 text-sm text-muted-foreground">
        <Cat className="h-5 w-5" />
        <p>© {new Date().getFullYear()} 百草 Baicao Blog</p>
      </div>
    </footer>
  );
}
