"use client";
import { Candidate } from "@/types";
import { formatDate, getScoreColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "./status-badge";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, SquareCheckBig } from "lucide-react";
import { useAppStore } from "@/store";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function CandidateTable({ candidates, loading }: { candidates: Candidate[]; loading?: boolean }) {
  const { selectedCandidates, toggleSelectCandidate } = useAppStore();

  if (loading) return <TableSkeleton />;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="w-10 p-3" />
            <th className="text-left p-3 font-medium text-muted-foreground">Candidate</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Skills</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Score</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Uploaded</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {candidates.map((c) => (
            <tr
              key={c.id}
              className={cn(
                "hover:bg-accent/30 transition-colors",
                selectedCandidates.includes(c.id) && "bg-primary/5",
              )}
            >
              <td className="p-3">
                <button onClick={() => toggleSelectCandidate(c.id)}>
                  <SquareCheckBig
                    className={cn(
                      "w-4 h-4 transition-colors",
                      selectedCandidates.includes(c.id)
                        ? "text-primary"
                        : "text-muted-foreground/30",
                    )}
                  />
                </button>
              </td>
              <td className="p-3">
                <div>
                  <p className="font-medium">{c.name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{c.email || c.city || "—"}</p>
                </div>
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-1 max-w-xs">
                  {c.skills?.slice(0, 3).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                  {(c.skills?.length ?? 0) > 3 && (
                    <Badge variant="outline" className="text-xs">+{c.skills!.length - 3}</Badge>
                  )}
                </div>
              </td>
              <td className="p-3">
                {c.overallScore != null ? (
                  <span className={cn("font-bold text-base", getScoreColor(c.overallScore))}>
                    {c.overallScore.toFixed(0)}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs">Not scored</span>
                )}
              </td>
              <td className="p-3">
                <StatusBadge candidateId={c.id} status={c.status} />
              </td>
              <td className="p-3 text-muted-foreground text-xs">{formatDate(c.createdAt)}</td>
              <td className="p-3 text-right">
                <Link href={`/candidates/${c.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="w-4 h-4" />
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
          {candidates.length === 0 && (
            <tr>
              <td colSpan={7} className="p-12 text-center text-muted-foreground">
                No candidates found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="p-4 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
