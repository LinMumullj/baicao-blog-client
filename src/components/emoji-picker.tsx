"use client";

import { useRef, useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

const COMMON_EMOJIS = [
  "😀", "😂", "🥰", "😍", "🤔", "😅", "😭", "😱",
  "👍", "👎", "👏", "🙏", "💪", "🎉", "🔥", "✨",
  "❤️", "💯", "🐱", "🐾", "☀️", "🌙", "⭐", "🌈",
  "📷", "🎵", "☕", "🍜", "🍰", "🎂", "🏃", "💤",
  "😊", "😎", "🤗", "😴", "🥳", "😇", "🤣", "🫶",
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiPicker({ onSelect, disabled }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        aria-label="插入 emoji"
      >
        <Smile className="h-4 w-4" />
      </Button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="关闭 emoji 面板"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "absolute bottom-full left-0 z-50 mb-2 grid w-64 grid-cols-8 gap-1 rounded-lg border border-border/60 bg-background p-2 shadow-lg"
            )}
          >
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="rounded p-1 text-lg transition-colors hover:bg-muted"
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function insertAtCursor(
  value: string,
  insertion: string,
  selectionStart: number,
  selectionEnd: number
) {
  return {
    nextValue:
      value.slice(0, selectionStart) + insertion + value.slice(selectionEnd),
    nextCursor: selectionStart + insertion.length,
  };
}
