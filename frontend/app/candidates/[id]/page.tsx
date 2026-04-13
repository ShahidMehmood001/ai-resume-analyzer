"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  ArrowLeft, Briefcase, Building2, FolderKanban,
  GraduationCap, Loader2, Wrench,
} from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreChart, ScoreRing } from "@/components/candidates/score-chart";
import { StatusBadge } from "@/components/candidates/status-badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { candidatesApi, jobsApi } from "@/lib/api";
import { formatDate, getScoreColor, cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const qc = useQueryClient();
  const [selectedJob, setSelectedJob] = useState("");
  const [chartType, setChartType] = useState<"radar" | "bar">("radar");

  const { data: candidate, isLoading } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => candidatesApi.get(id),
  });

  const { data: jobs } = useQuery({
    queryKey: ["jobs"],
    queryFn: jobsApi.list,
  });

  const scoreMutation = useMutation({
    mutationFn: () => jobsApi.score(selectedJob, id),
    onSuccess: () => {
      toast.success("Scoring complete!");
      qc.invalidateQueries({ queryKey: ["candidate", id] });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  if (isLoading) {
    return (
      <Shell>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
        </div>
      </Shell>
    );
  }

  if (!candidate) {
    return (
      <Shell>
        <p className="text-[var(--color-muted-foreground)]">Candidate not found.</p>
      </Shell>
    );
  }

  const latestScore = candidate.resumes?.[0]?.scores?.[0] ?? null;

  return (
    <Shell>
      {/* Back */}
      <Link href="/candidates">
        <Button variant="ghost" size="sm" className="mb-5 -ml-1 gap-1.5 text-xs">
          <ArrowLeft className="h-3.5 w-3.5" />
          All candidates
        </Button>
      </Link>

      {/* Hero header */}
      <div className="mb-7 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-2xl font-bold text-[var(--color-primary)]">
            {(candidate.name?.[0] ?? "?").toUpperCase()}
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {candidate.name || "Unknown candidate"}
            </h1>
            <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)]">
              {[candidate.email, candidate.city].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Uploaded {formatDate(candidate.createdAt)}
            </p>
          </div>
        </div>
        <StatusBadge candidateId={candidate.id} status={candidate.status} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* ── Left: Profile details ─────────────────────────────────────── */}
        <div className="col-span-2 space-y-5">
          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.skills?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((s: string) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  No skills extracted
                </p>
              )}
            </CardContent>
          </Card>

          {/* Work experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.workExperience?.length ? (
                <div className="space-y-5">
                  {candidate.workExperience.map((w: any, i: number) => (
                    <div key={i} className="relative pl-4">
                      <span className="absolute left-0 top-1.5 h-full w-[2px] rounded-full bg-[var(--color-primary)]/25" />
                      <p className="font-semibold text-[var(--color-foreground)]">
                        {w.position}
                        <span className="font-normal text-[var(--color-muted-foreground)]">
                          {" "}at {w.company}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                        {w.period}
                      </p>
                      {w.summary && (
                        <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                          {w.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  No work experience extracted
                </p>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidate.education?.length ? (
                <div className="space-y-4">
                  {candidate.education.map((e: any, i: number) => (
                    <div key={i}>
                      <p className="font-semibold">{e.school}</p>
                      <p className="mt-0.5 text-sm text-[var(--color-muted-foreground)]">
                        {[e.degree, e.major, e.graduationDate]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  No education extracted
                </p>
              )}
            </CardContent>
          </Card>

          {/* Projects */}
          {candidate.projects?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {candidate.projects.map((p: any, i: number) => (
                  <div key={i}>
                    <p className="font-semibold">{p.name}</p>
                    {p.role && (
                      <p className="text-xs text-[var(--color-muted-foreground)]">{p.role}</p>
                    )}
                    {p.highlights && (
                      <p className="mt-1 text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                        {p.highlights}
                      </p>
                    )}
                    {p.techStack?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.techStack.map((t: string) => (
                          <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right: Scoring ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Run scoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                AI Scoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job position…" />
                </SelectTrigger>
                <SelectContent>
                  {jobs?.map((j: any) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                disabled={!selectedJob || scoreMutation.isPending}
                onClick={() => scoreMutation.mutate()}
              >
                {scoreMutation.isPending ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Scoring…</>
                ) : (
                  "Run AI Scoring"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Score results */}
          {latestScore && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Score</CardTitle>
                  <div className="flex items-center gap-1">
                    {(["radar", "bar"] as const).map((t) => (
                      <Button
                        key={t}
                        size="sm"
                        variant={chartType === t ? "default" : "ghost"}
                        className="h-6 px-2 text-xs capitalize"
                        onClick={() => setChartType(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Big score */}
                <div className="mb-4 flex items-center justify-center gap-4">
                  <ScoreRing score={latestScore.overallScore} size={72} />
                  <div>
                    <p className={cn("text-4xl font-bold tabular-nums", getScoreColor(latestScore.overallScore))}>
                      {latestScore.overallScore.toFixed(0)}
                    </p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">out of 100</p>
                  </div>
                </div>

                <ScoreChart score={latestScore} type={chartType} />

                {/* Sub-scores */}
                <div className="mt-4 space-y-2">
                  {[
                    { label: "Skill match",     value: latestScore.skillMatch },
                    { label: "Experience",       value: latestScore.experienceRelevance },
                    { label: "Education",        value: latestScore.educationFit },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-muted-foreground)]">{label}</span>
                      <span className={cn("font-semibold tabular-nums", getScoreColor(value))}>
                        {value.toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* AI comment */}
                {latestScore.aiComment && (
                  <div className="mt-4 rounded-[var(--radius)] bg-[var(--color-muted)]/50 px-3.5 py-3 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
                    {latestScore.aiComment}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Shell>
  );
}
