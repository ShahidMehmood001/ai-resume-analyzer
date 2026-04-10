"use client";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/button";
import { X, GitCompare } from "lucide-react";
import { useRouter } from "next/navigation";

export function CompareBar() {
  const { selectedCandidates, clearSelection } = useAppStore();
  const router = useRouter();

  if (selectedCandidates.length < 2) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-3 bg-card border border-border rounded-full px-5 py-3 shadow-xl">
        <span className="text-sm font-medium">
          {selectedCandidates.length} candidates selected
        </span>
        <Button
          size="sm"
          onClick={() => router.push(`/candidates/compare?ids=${selectedCandidates.join(",")}`)}
        >
          <GitCompare className="w-4 h-4" /> Compare
        </Button>
        <button onClick={clearSelection}>
          <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </div>
  );
}
