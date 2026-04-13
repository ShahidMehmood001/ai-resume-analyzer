"use client";

import Link from "next/link";
import { Eye, CheckSquare, Square } from "lucide-react";
import { type Candidate } from "@/types";
import { formatRelativeDate, getScoreColor, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./status-badge";
import { useAppStore } from "@/store";

interface CandidateTableProps {
  candidates: Candidate[];
  loading?: boolean;
}

export function CandidateTable({ candidates, loading }: CandidateTableProps) {
  const { selectedCandidates, toggleSelectCandidate } = useAppStore();

  if (loading) return <TableSkeleton />;

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40">
            <th className="w-10 px-4 py-3" />
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Candidate
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Skills
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Score
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Added
            </th>
            <th className="w-12 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)]">
          {candidates.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-14 text-center text-sm text-[var(--color-muted-foreground)]">
                No candidates match your filters
              </td>
            </tr>
          ) : (
            candidates.map((c) => {
              const selected = selectedCandidates.includes(c.id);
              return (
                <tr
                  key={c.id}
                  className={cn(
                    "transition-colors",
                    selected
                      ? "bg-[var(--color-primary)]/5"
                      : "hover:bg-[var(--color-accent)]/50",
                  )}
                >
                  {/* Select */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSelectCandidate(c.id)}
                      className="flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      {selected ? (
                        <CheckSquare className="h-4 w-4 text-[var(--color-primary)]" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </td>

                  {/* Candidate */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-xs font-bold text-[var(--color-primary)]">
                        {(c.name?.[0] ?? "?").toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-[var(--color-foreground)]">
                          {c.name || "—"}
                        </p>
                        <p className="text-xs text-[var(--color-muted-foreground)]">
                          {c.email || c.city || "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Skills */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {c.skills?.slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                      {(c.skills?.length ?? 0) > 3 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{c.skills!.length - 3}
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Score */}
                  <td className="px-4 py-3">
                    {c.overallScore != null ? (
                      <span className={cn("text-base font-bold tabular-nums", getScoreColor(c.overallScore))}>
                        {c.overallScore.toFixed(0)}
                        <span className="text-xs font-normal text-[var(--color-muted-foreground)]">/100</span>
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--color-muted-foreground)]">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge candidateId={c.id} status={c.status} />
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-xs text-[var(--color-muted-foreground)]">
                    {formatRelativeDate(c.createdAt)}
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    <Link href={`/candidates/${c.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <div className="space-y-0">
        <div className="bg-[var(--color-muted)]/40 px-4 py-3">
          <Skeleton className="h-4 w-48" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-[var(--color-border)] px-4 py-4">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-3.5 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}
