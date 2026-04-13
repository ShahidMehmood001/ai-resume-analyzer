"use client";

import { useMemo, useState } from "react";
import { Loader2, Rows3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Job, ResumeScore } from "@/types";
import { getScoreColor, cn } from "@/lib/utils";

type Props = {
  jobs: Job[];
  scores: ResumeScore[];
  scoring: boolean;
  onScoreSelected: (jobIds: string[]) => void;
};

export function MultiJobScorePanel({
  jobs,
  scores,
  scoring,
  onScoreSelected,
}: Props) {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const scoreByJobId = useMemo(() => {
    const m = new Map<string, ResumeScore>();
    for (const s of scores) m.set(s.jobId, s);
    return m;
  }, [scores]);

  const toggle = (jobId: string) =>
    setSelected((p) => ({ ...p, [jobId]: !p[jobId] }));

  const selectedIds = Object.keys(selected).filter((id) => selected[id]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Rows3 className="h-4 w-4 text-[var(--color-primary)]" />
          Compare across job descriptions
        </CardTitle>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Select one or more JDs and run AI scoring to compare dimensions side by side. Existing scores are updated when you re-run.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {jobs.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Create a job on the Jobs page first.
          </p>
        ) : (
          <>
            <div className="max-h-48 space-y-2 overflow-y-auto rounded-[var(--radius)] border border-[var(--color-border)] p-2">
              {jobs.map((j) => (
                <label
                  key={j.id}
                  className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-2 py-1.5 hover:bg-[var(--color-accent)]/50"
                >
                  <input
                    type="checkbox"
                    checked={!!selected[j.id]}
                    onChange={() => toggle(j.id)}
                    className="h-3.5 w-3.5 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                  />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{j.title}</span>
                  {scoreByJobId.has(j.id) && (
                    <span className={cn("text-xs font-semibold tabular-nums", getScoreColor(scoreByJobId.get(j.id)!.overallScore))}>
                      {scoreByJobId.get(j.id)!.overallScore.toFixed(0)}
                    </span>
                  )}
                </label>
              ))}
            </div>
            <Button
              className="w-full"
              disabled={!selectedIds.length || scoring}
              onClick={() => onScoreSelected(selectedIds)}
            >
              {scoring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scoring…
                </>
              ) : (
                `Run AI scoring (${selectedIds.length} job${selectedIds.length !== 1 ? "s" : ""})`
              )}
            </Button>

            {scores.length > 0 && (
              <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--color-border)]">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/40">
                      <th className="px-3 py-2 font-medium">Job</th>
                      <th className="px-2 py-2 font-medium tabular-nums">Overall</th>
                      <th className="px-2 py-2 font-medium tabular-nums">Skills</th>
                      <th className="px-2 py-2 font-medium tabular-nums">Exp.</th>
                      <th className="px-2 py-2 font-medium tabular-nums">Edu.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...scores]
                      .sort(
                        (a, b) =>
                          (a.job?.title ?? "").localeCompare(b.job?.title ?? ""),
                      )
                      .map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-[var(--color-border)]/60 last:border-0"
                        >
                          <td className="max-w-[180px] truncate px-3 py-2 font-medium">
                            {s.job?.title ?? s.jobId.slice(0, 8) + "…"}
                          </td>
                          <td className={cn("px-2 py-2 font-semibold tabular-nums", getScoreColor(s.overallScore))}>
                            {s.overallScore.toFixed(0)}
                          </td>
                          <td className="px-2 py-2 tabular-nums text-[var(--color-muted-foreground)]">
                            {s.skillMatch.toFixed(0)}
                          </td>
                          <td className="px-2 py-2 tabular-nums text-[var(--color-muted-foreground)]">
                            {s.experienceRelevance.toFixed(0)}
                          </td>
                          <td className="px-2 py-2 tabular-nums text-[var(--color-muted-foreground)]">
                            {s.educationFit.toFixed(0)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
