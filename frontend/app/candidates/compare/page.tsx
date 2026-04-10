"use client";
import { use, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { candidatesApi } from "@/lib/api";
import { getScoreColor } from "@/lib/utils";
import { ScoreChart } from "@/components/candidates/score-chart";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 3);

  const queries = ids.map((id) => useQuery({
    queryKey: ["candidate", id],
    queryFn: () => candidatesApi.get(id),
    enabled: !!id,
  }));

  const candidates = queries.map((q) => q.data).filter(Boolean);

  return (
    <Shell>
      <div className="mb-6">
        <Link href="/candidates">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Compare Candidates</h1>
      </div>

      {candidates.length < 2 ? (
        <p className="text-muted-foreground">Select at least 2 candidates from the candidates list to compare.</p>
      ) : (
        <div className={`grid gap-6`} style={{ gridTemplateColumns: `repeat(${candidates.length}, 1fr)` }}>
          {candidates.map((c: any) => (
            <div key={c.id} className="space-y-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary mx-auto mb-2">
                    {(c.name?.[0] ?? "?").toUpperCase()}
                  </div>
                  <h2 className="font-semibold">{c.name}</h2>
                  <p className="text-xs text-muted-foreground">{c.city}</p>
                  {c.overallScore != null && (
                    <p className={`text-3xl font-bold mt-3 ${getScoreColor(c.overallScore)}`}>
                      {c.overallScore.toFixed(0)}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {c.skills?.map((s: string) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {c.resumes?.[0]?.scores?.[0] && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs">Score Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScoreChart score={c.resumes[0].scores[0]} type="bar" />
                    <p className="text-xs text-muted-foreground mt-3">{c.resumes[0].scores[0].aiComment}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

export default function ComparePage() {
  return <Suspense><CompareContent /></Suspense>;
}
