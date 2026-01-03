"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getBrandIcon } from "@/lib/brand-icons";

function initials(name: string) {
  const t = name.trim();
  if (!t) return "??";
  const parts = t.split(/\s+/);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0] ?? parts[0]?.[1] ?? "?";
  return (a + b).toUpperCase();
}

export function BrandAvatar({ name, slug }: { name: string; slug?: string }) {
  const icon = getBrandIcon(slug);
  return (
    <Avatar className="h-9 w-9 rounded-2xl border bg-foreground/5">
      <AvatarFallback className="rounded-2xl bg-transparent text-foreground/90">
        {icon ? (
          <svg
            viewBox="0 0 24 24"
            aria-label={icon.title}
            className="h-5 w-5"
            fill="currentColor"
          >
            <path d={icon.path} />
          </svg>
        ) : (
          <span className="text-[10px] font-medium">{initials(name)}</span>
        )}
      </AvatarFallback>
    </Avatar>
  );
}
