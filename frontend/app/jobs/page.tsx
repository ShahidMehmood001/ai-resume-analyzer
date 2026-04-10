"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { jobsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Plus, Trash2, Briefcase, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export default function JobsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", requiredSkills: "", bonusSkills: "", experienceYears: "",
  });

  const { data: jobs, isLoading } = useQuery({ queryKey: ["jobs"], queryFn: jobsApi.list });

  const createMutation = useMutation({
    mutationFn: () =>
      jobsApi.create({
        title: form.title,
        description: form.description,
        requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        bonusSkills: form.bonusSkills.split(",").map((s) => s.trim()).filter(Boolean),
        experienceYears: form.experienceYears ? parseInt(form.experienceYears) : undefined,
      }),
    onSuccess: () => {
      toast.success("Job created!");
      qc.invalidateQueries({ queryKey: ["jobs"] });
      setShowForm(false);
      setForm({ title: "", description: "", requiredSkills: "", bonusSkills: "", experienceYears: "" });
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: jobsApi.remove,
    onSuccess: () => {
      toast.success("Job deleted");
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  return (
    <Shell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Job Positions</h1>
          <p className="text-muted-foreground mt-1">Manage JDs and score candidates</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Position
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="mb-6 animate-slide-up">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New Job Position</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Job title (e.g. Senior Full Stack Engineer)"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
            <textarea
              placeholder="Job description…"
              rows={4}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <Input
              placeholder="Required skills (comma-separated): React, TypeScript, Node.js"
              value={form.requiredSkills}
              onChange={(e) => setForm((p) => ({ ...p, requiredSkills: e.target.value }))}
            />
            <Input
              placeholder="Bonus skills (comma-separated): GraphQL, Docker"
              value={form.bonusSkills}
              onChange={(e) => setForm((p) => ({ ...p, bonusSkills: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Min. years of experience"
              value={form.experienceYears}
              onChange={(e) => setForm((p) => ({ ...p, experienceYears: e.target.value }))}
            />
            <Button
              className="w-full"
              disabled={!form.title || !form.description || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
              ) : "Create Job"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Jobs list */}
      <div className="space-y-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl skeleton" />
            ))
          : jobs?.map((job: any) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold">{job.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {job.requiredSkills?.map((s: string) => (
                          <Badge key={s} variant="default" className="text-xs">{s}</Badge>
                        ))}
                        {job.bonusSkills?.map((s: string) => (
                          <Badge key={s} variant="secondary" className="text-xs">+{s}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{formatDate(job.createdAt)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-500"
                      onClick={() => deleteMutation.mutate(job.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        {!isLoading && jobs?.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No jobs yet. Add your first position above.</p>
          </div>
        )}
      </div>
    </Shell>
  );
}
