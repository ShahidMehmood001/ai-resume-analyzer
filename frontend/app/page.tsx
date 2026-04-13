"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Briefcase, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { candidatesApi, jobsApi } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  Pending:      "var(--color-muted-foreground)",
  Shortlisted:  "var(--color-status-shortlisted-text)",
  Interviewing: "var(--color-status-interviewing-text)",
  Hired:        "var(--color-score-high)",
  Rejected:     "var(--color-score-low)",
};

export default function DashboardPage() {
  const { data: candidates, isLoading: cl } = useQuery({
    queryKey: ["candidates", "dashboard"],
    queryFn: () => candidatesApi.list({ limit: "200" }),
  });
  const { data: jobs, isLoading: jl } = useQuery({
    queryKey: ["jobs"],
    queryFn: jobsApi.list,
  });

  const list = candidates?.data ?? [];
  const scored = list.filter((c: any) => c.overallScore != null);
  const avgScore = scored.length
    ? scored.reduce((a: number, c: any) => a + c.overallScore, 0) / scored.length
    : 0;
  const hired = list.filter((c: any) => c.status === "hired").length;

  const pipelineData = [
    "pending", "shortlisted", "interviewing", "hired", "rejected",
  ].map((s) => ({
    status: s.charAt(0).toUpperCase() + s.slice(1),
    count: list.filter((c: any) => c.status === s).length,
  }));

  const stats = [
    {
      label: "Total Candidates",
      value: list.length,
      icon: Users,
      accent: "var(--color-status-shortlisted-text)",
      loading: cl,
    },
    {
      label: "Open Positions",
      value: jobs?.length ?? 0,
      icon: Briefcase,
      accent: "var(--color-status-interviewing-text)",
      loading: jl,
    },
    {
      label: "Avg Score",
      value: avgScore ? avgScore.toFixed(1) : "—",
      icon: TrendingUp,
      accent: "var(--color-score-mid)",
      loading: cl,
    },
    {
      label: "Hired",
      value: hired,
      icon: CheckCircle2,
      accent: "var(--color-score-high)",
      loading: cl,
    },
  ];

  return (
    <Shell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Recruitment pipeline overview
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, accent, loading }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                    {label}
                  </p>
                  {loading ? (
                    <Skeleton className="mt-2 h-8 w-14" />
                  ) : (
                    <p className="mt-1.5 text-3xl font-bold tabular-nums tracking-tight">
                      {value}
                    </p>
                  )}
                </div>
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-[var(--radius)] mt-0.5"
                  style={{ background: `${accent}18` }}
                >
                  <Icon className="h-4.5 w-4.5" style={{ color: accent }} />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Candidate Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          {cl ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={pipelineData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-accent)" }}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    fontSize: 12,
                    boxShadow: "0 4px 16px rgba(0,0,0,.1)",
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={52}>
                  {pipelineData.map((d) => (
                    <Cell
                      key={d.status}
                      fill={STATUS_COLORS[d.status] ?? "var(--color-primary)"}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </Shell>
  );
}
