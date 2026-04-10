"use client";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { candidatesApi, jobsApi } from "@/lib/api";
import { Users, Briefcase, TrendingUp, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const { data: candidates, isLoading: cLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => candidatesApi.list({ limit: "100" }),
  });
  const { data: jobs, isLoading: jLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: jobsApi.list,
  });

  const list = candidates?.data ?? [];
  const hired = list.filter((c: any) => c.status === "hired").length;
  const avgScore =
    list.filter((c: any) => c.overallScore).reduce((a: number, c: any) => a + c.overallScore, 0) /
      (list.filter((c: any) => c.overallScore).length || 1) || 0;

  const statusChart = ["pending", "shortlisted", "interviewing", "hired", "rejected"].map((s) => ({
    status: s.charAt(0).toUpperCase() + s.slice(1),
    count: list.filter((c: any) => c.status === s).length,
  }));

  const stats = [
    { label: "Total Candidates", value: list.length, icon: Users, color: "text-blue-400" },
    { label: "Open Positions", value: jobs?.length ?? 0, icon: Briefcase, color: "text-violet-400" },
    { label: "Avg. Score", value: avgScore.toFixed(1), icon: TrendingUp, color: "text-yellow-400" },
    { label: "Hired", value: hired, icon: CheckCircle, color: "text-emerald-400" },
  ];

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your recruitment pipeline</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  {cLoading || jLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold mt-1">{value}</p>
                  )}
                </div>
                <Icon className={`w-8 h-8 ${color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline Status</CardTitle>
        </CardHeader>
        <CardContent>
          {cLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </Shell>
  );
}
