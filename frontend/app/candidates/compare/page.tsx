"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreChart, ScoreRing } from "@/components/candidates/score-chart";
import { StatusPill } from "@/components/candidates/status-badge";
import { candidatesApi } from "@/lib/api";
import { getScoreColor } from "@/lib/utils";

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 3);

  // Fetch each candidate independently so partial failures don't break the view
  const queries = ids.map((id) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ["candidate", id],
      queryFn: () => candidatesApi.get(id),
      enabled: !!id,
    }),
  );

  const candidates = queries.map((q) => q.data).filter(Boolean);

  if (candidates.length < 2) {
    return (
      <Shell>
        <Link href="/candidates">
          <Button variant="ghost" size="sm" className="mb-5 -ml-1 gap-1.5 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
        </Link>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Select at least 2 candidates from the candidates list to compare.
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <Link href="/candidates">
        <Button variant="ghost" size="sm" className="mb-5 -ml-1 gap-1.5 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to candidates
        </Button>
      </Link>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">
        Compare candidates
      </h1>

      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: `repeat(${candidates.length}, 1fr)` }}
      >
        {candidates.map((c: any) => {
          const score = c.resumes?.[0]?.scores?.[0] ?? null;
          return (
            <div key={c.id} className="space-y-4">
              {/* Identity card */}
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-base font-bold text-[var(--color-primary)]">
                      {(c.name?.[0] ?? "?").toUpperCase()}
                    </span>
                    {c.overallScore != null && (
                      <ScoreRing score={c.overallScore} size={44} />
                    )}
                  </div>
                  <p className="font-semibold">{c.name || "—"}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                    {c.city || "—"}
                  </p>
                  <div className="mt-3">
                    <StatusPill status={c.status} />
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {c.skills?.map((s: string) => (
                      <Badge key={s} variant="secondary" className="text-[10px]">
                        {s}
                      </Badge>
                    )) ?? (
                      <span className="text-xs text-[var(--color-muted-foreground)]">—</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Score breakdown */}
              {score && (
                <Card>
                  <CardHeader>
                    <CardTitle>Score breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScoreChart score={score} type="bar" />
                    <div className="mt-4 space-y-1.5">
                      {[
                        { label: "Overall",    value: score.overallScore },
                        { label: "Skills",     value: score.skillMatch },
                        { label: "Experience", value: score.experienceRelevance },
                        { label: "Education",  value: score.educationFit },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between text-xs">
                          <span className="text-[var(--color-muted-foreground)]">{label}</span>
                          <span className={`font-bold tabular-nums ${getScoreColor(value)}`}>
                            {value.toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {score.aiComment && (
                      <p className="mt-4 text-xs leading-relaxed text-[var(--color-muted-foreground)] border-t border-[var(--color-border)] pt-3">
                        {score.aiComment}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

export default function ComparePage() {
  return (
    <Suspense>
      <CompareContent />
    </Suspense>
  );
}
