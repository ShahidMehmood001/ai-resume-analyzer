"use client";

import { useRouter } from "next/navigation";
import { GitCompareArrows, X } from "lucide-react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CompareBar() {
  const { selectedCandidates, clearSelection } = useAppStore();
  const router = useRouter();

  if (selectedCandidates.length < 2) return null;

  const canCompare = selectedCandidates.length >= 2;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        "animate-slide-up",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-full px-5 py-3",
          "border border-[var(--color-border)]",
          "bg-[var(--color-card)] shadow-xl shadow-black/20",
          "backdrop-blur-sm",
        )}
      >
        <div className="flex items-center gap-2">
          {selectedCandidates.slice(0, 3).map((_, i) => (
            <span
              key={i}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-[10px] font-bold text-[var(--color-primary)]"
            >
              {i + 1}
            </span>
          ))}
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            {selectedCandidates.length} selected
          </span>
        </div>

        <Button
          size="sm"
          disabled={!canCompare}
          onClick={() =>
            router.push(
              `/candidates/compare?ids=${selectedCandidates.join(",")}`,
            )
          }
        >
          <GitCompareArrows className="h-3.5 w-3.5" />
          Compare
        </Button>

        <button
          onClick={clearSelection}
          className="rounded-full p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
