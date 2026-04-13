"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Loader2, Plus, Trash2, X } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { jobsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface JobForm {
  title: string;
  description: string;
  requiredSkills: string;
  bonusSkills: string;
  experienceYears: string;
}

const EMPTY_FORM: JobForm = {
  title: "",
  description: "",
  requiredSkills: "",
  bonusSkills: "",
  experienceYears: "",
};

export default function JobsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<JobForm>(EMPTY_FORM);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: jobsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      jobsApi.create({
        title: form.title,
        description: form.description,
        requiredSkills: form.requiredSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        bonusSkills: form.bonusSkills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experienceYears: form.experienceYears
          ? parseInt(form.experienceYears)
          : undefined,
      }),
    onSuccess: () => {
      toast.success("Job position created");
      qc.invalidateQueries({ queryKey: ["jobs"] });
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const deleteMutation = useMutation({
    mutationFn: jobsApi.remove,
    onSuccess: () => {
      toast.success("Job removed");
      qc.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  const field = (key: keyof JobForm) => ({
    value: form[key],
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setForm((p) => ({ ...p, [key]: e.target.value })),
  });

  return (
    <Shell>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Positions</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Define roles and score candidates against them
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-4 w-4" />
          Add position
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>New position</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Job title" {...field("title")} />
            <textarea
              placeholder="Job description — paste the full JD for better scoring accuracy"
              rows={5}
              className="w-full resize-none rounded-[var(--radius)] border border-[var(--color-input)] bg-[var(--color-surface)] px-3 py-2 text-sm placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]"
              {...field("description")}
            />
            <Input
              placeholder="Required skills (comma-separated): React, TypeScript, Node.js"
              {...field("requiredSkills")}
            />
            <Input
              placeholder="Nice-to-have skills: GraphQL, Docker, Redis"
              {...field("bonusSkills")}
            />
            <Input
              type="number"
              placeholder="Minimum years of experience"
              {...field("experienceYears")}
            />
            <Button
              className="w-full"
              disabled={
                !form.title || !form.description || createMutation.isPending
              }
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating…</>
              ) : (
                "Create position"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Jobs list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-[var(--radius-lg)] skeleton" />
          ))
        ) : jobs?.length ? (
          jobs.map((job: any) => (
            <Card key={job.id} className="hover:border-[var(--color-primary)]/20 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                      <h3 className="font-semibold truncate">{job.title}</h3>
                    </div>
                    <p className="mt-1.5 text-sm text-[var(--color-muted-foreground)] line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.requiredSkills?.map((s: string) => (
                        <Badge key={s} variant="default" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                      {job.bonusSkills?.map((s: string) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">
                          +{s}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
                      Created {formatDate(job.createdAt)}
                      {job.experienceYears && ` · ${job.experienceYears}+ years`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-[var(--color-muted-foreground)] hover:text-red-500 transition-colors"
                    onClick={() => deleteMutation.mutate(job.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-[var(--color-muted-foreground)]">
            <Briefcase className="mb-3 h-10 w-10 opacity-25" />
            <p className="text-sm">No positions yet</p>
            <p className="text-xs mt-1">Add your first job description to start scoring candidates</p>
          </div>
        )}
      </div>
    </Shell>
  );
}
