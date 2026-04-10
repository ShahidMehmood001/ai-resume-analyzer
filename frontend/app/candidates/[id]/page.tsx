"use client";
import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreChart } from "@/components/candidates/score-chart";
import { StatusBadge } from "@/components/candidates/status-badge";
import { candidatesApi, jobsApi } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, getScoreColor } from "@/lib/utils";
import { ArrowLeft, Briefcase, Loader2, GraduationCap, Building2, Wrench, FolderKanban } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const [selectedJob, setSelectedJob] = useState("");
  const [chartType, setChartType] = useState<"radar" | "bar">("radar");

  const { data: candidate, isLoading } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => candidatesApi.get(id),
  });

  const { data: jobs } = useQuery({ queryKey: ["jobs"], queryFn: jobsApi.list });

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
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Shell>
    );
  }

  if (!candidate) return <Shell><p>Candidate not found</p></Shell>;

  const latestScore = candidate.resumes?.[0]?.scores?.[0] ?? null;

  return (
    <Shell>
      <div className="mb-6">
        <Link href="/candidates">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Candidates
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {(candidate.name?.[0] ?? "?").toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{candidate.name || "Unknown"}</h1>
              <p className="text-muted-foreground">{candidate.email} · {candidate.city}</p>
              <p className="text-xs text-muted-foreground mt-1">Uploaded {formatDate(candidate.createdAt)}</p>
            </div>
          </div>
          <StatusBadge candidateId={candidate.id} status={candidate.status} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column */}
        <div className="col-span-2 space-y-6">
          {/* Skills */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4" /> Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {candidate.skills?.map((s: string) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                )) ?? <p className="text-sm text-muted-foreground">No skills extracted</p>}
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate.workExperience?.map((w: any, i: number) => (
                <div key={i} className="border-l-2 border-primary/30 pl-4">
                  <p className="font-medium">{w.position} at {w.company}</p>
                  <p className="text-xs text-muted-foreground">{w.period}</p>
                  <p className="text-sm mt-1 text-muted-foreground">{w.summary}</p>
                </div>
              )) ?? <p className="text-sm text-muted-foreground">No work experience extracted</p>}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidate.education?.map((e: any, i: number) => (
                <div key={i}>
                  <p className="font-medium">{e.school}</p>
                  <p className="text-sm text-muted-foreground">{e.degree} · {e.major} · {e.graduationDate}</p>
                </div>
              )) ?? <p className="text-sm text-muted-foreground">No education extracted</p>}
            </CardContent>
          </Card>

          {/* Projects */}
          {candidate.projects?.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FolderKanban className="w-4 h-4" /> Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate.projects.map((p: any, i: number) => (
                  <div key={i}>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">{p.role}</p>
                    <p className="text-sm mt-1">{p.highlights}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.techStack?.map((t: string) => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Score */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Score Against Job
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job…" />
                </SelectTrigger>
                <SelectContent>
                  {jobs?.map((j: any) => (
                    <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                className="w-full"
                disabled={!selectedJob || scoreMutation.isPending}
                onClick={() => scoreMutation.mutate()}
              >
                {scoreMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Scoring…</>
                ) : "Run AI Scoring"}
              </Button>
            </CardContent>
          </Card>

          {latestScore && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Score Results</CardTitle>
                  <div className="flex gap-1">
                    {(["radar", "bar"] as const).map((t) => (
                      <Button
                        key={t}
                        size="sm"
                        variant={chartType === t ? "default" : "ghost"}
                        className="h-6 px-2 text-xs"
                        onClick={() => setChartType(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-4xl font-bold text-center mb-4 ${getScoreColor(latestScore.overallScore)}`}>
                  {latestScore.overallScore.toFixed(0)}
                  <span className="text-base font-normal text-muted-foreground">/100</span>
                </div>
                <ScoreChart score={latestScore} type={chartType} />
                <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  {latestScore.aiComment}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Shell>
  );
}
