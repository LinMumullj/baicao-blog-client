"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  _count: { postTags: number };
}

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ value, onChange }: TagInputProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setAllTags(data));
  }, []);

  const suggestions = allTags.filter(
    (tag) =>
      !value.includes(tag.name) &&
      tag.name.toLowerCase().includes(input.toLowerCase()),
  );

  function addTag(name: string) {
    const trimmed = name.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  function removeTag(name: string) {
    onChange(value.filter((t) => t !== name));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim()) {
        addTag(input);
      }
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="输入标签，按回车添加"
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-foreground"
        />

        {/* Suggestions dropdown */}
        {showSuggestions && input && suggestions.length > 0 && (
          <div className="absolute top-full z-10 mt-1 w-full rounded-md border border-border bg-background shadow-sm">
            {suggestions.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addTag(tag.name)}
                className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span>{tag.name}</span>
                <span className="text-xs text-muted-foreground">
                  {tag._count.postTags}篇
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
