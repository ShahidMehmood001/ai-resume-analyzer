"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Candidate, Education, Project, WorkExperience } from "@/types";
import { cn } from "@/lib/utils";

const emptyEdu = (): Education => ({
  school: "",
  major: "",
  degree: "",
  graduationDate: "",
});

const emptyWork = (): WorkExperience => ({
  company: "",
  position: "",
  period: "",
  summary: "",
});

const emptyProject = (): Project => ({
  name: "",
  techStack: [],
  role: "",
  highlights: "",
});

type Props = {
  candidate: Candidate;
  onCancel: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
};

export function CandidateProfileEditor({
  candidate,
  onCancel,
  onSave,
}: Props) {
  const [name, setName] = useState(candidate.name ?? "");
  const [email, setEmail] = useState(candidate.email ?? "");
  const [phone, setPhone] = useState(candidate.phone ?? "");
  const [city, setCity] = useState(candidate.city ?? "");
  const [skillsStr, setSkillsStr] = useState(
    (candidate.skills ?? []).join(", "),
  );
  const [education, setEducation] = useState<Education[]>(
    candidate.education?.length ? candidate.education : [emptyEdu()],
  );
  const [workExperience, setWorkExperience] = useState<WorkExperience[]>(
    candidate.workExperience?.length
      ? candidate.workExperience
      : [emptyWork()],
  );
  const [projects, setProjects] = useState<Project[]>(
    candidate.projects?.length ? candidate.projects : [emptyProject()],
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(candidate.name ?? "");
    setEmail(candidate.email ?? "");
    setPhone(candidate.phone ?? "");
    setCity(candidate.city ?? "");
    setSkillsStr((candidate.skills ?? []).join(", "));
    setEducation(candidate.education?.length ? candidate.education : [emptyEdu()]);
    setWorkExperience(
      candidate.workExperience?.length
        ? candidate.workExperience
        : [emptyWork()],
    );
    setProjects(candidate.projects?.length ? candidate.projects : [emptyProject()]);
  }, [candidate]);

  const fieldClass = "w-full rounded-[var(--radius)] border border-[var(--color-input)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-foreground)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]";

  const handleSave = async () => {
    const skills = skillsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const eduPayload = education
      .filter((e) => e.school.trim() || e.major.trim() || e.degree.trim())
      .map((e) => ({
        school: e.school.trim(),
        major: e.major.trim(),
        degree: e.degree.trim(),
        graduationDate: e.graduationDate.trim(),
      }));
    const workPayload = workExperience
      .filter((w) => w.company.trim() || w.position.trim())
      .map((w) => ({
        company: w.company.trim(),
        position: w.position.trim(),
        period: w.period.trim(),
        summary: w.summary.trim(),
      }));
    const projectPayload = projects
      .filter((p) => p.name.trim())
      .map((p) => ({
        name: p.name.trim(),
        role: p.role.trim(),
        highlights: p.highlights.trim(),
        techStack: Array.isArray(p.techStack) ? p.techStack : [],
      }));

    setSaving(true);
    try {
      await onSave({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        skills: skills.length ? skills : [],
        education: eduPayload,
        workExperience: workPayload,
        projects: projectPayload,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-[var(--color-primary)]/25">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Correct AI extraction</CardTitle>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Update fields below and save — changes are stored on the candidate record.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted-foreground)]">
              Name
            </label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted-foreground)]">
              Email
            </label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted-foreground)]">
              Phone
            </label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--color-muted-foreground)]">
              City
            </label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--color-muted-foreground)]">
            Skills (comma-separated)
          </label>
          <Input
            value={skillsStr}
            onChange={(e) => setSkillsStr(e.target.value)}
            placeholder="React, TypeScript, Python"
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Education</p>
          {education.map((row, i) => (
            <div
              key={i}
              className="relative space-y-2 rounded-[var(--radius)] border border-[var(--color-border)] p-3"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7 text-[var(--color-muted-foreground)]"
                onClick={() =>
                  setEducation((prev) => prev.filter((_, j) => j !== i))
                }
                disabled={education.length <= 1}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <div className="grid gap-2 sm:grid-cols-2 pr-8">
                <Input
                  placeholder="School"
                  value={row.school}
                  onChange={(e) =>
                    setEducation((prev) =>
                      prev.map((x, j) =>
                        j === i ? { ...x, school: e.target.value } : x,
                      ),
                    )
                  }
                />
                <Input
                  placeholder="Major"
                  value={row.major}
                  onChange={(e) =>
                    setEducation((prev) =>
                      prev.map((x, j) =>
                        j === i ? { ...x, major: e.target.value } : x,
                      ),
                    )
                  }
                />
                <Input
                  placeholder="Degree"
                  value={row.degree}
                  onChange={(e) =>
                    setEducation((prev) =>
                      prev.map((x, j) =>
                        j === i ? { ...x, degree: e.target.value } : x,
                      ),
                    )
                  }
                />
                <Input
                  placeholder="Graduation"
                  value={row.graduationDate}
                  onChange={(e) =>
                    setEducation((prev) =>
                      prev.map((x, j) =>
                        j === i ? { ...x, graduationDate: e.target.value } : x,
                      ),
                    )
                  }
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setEducation((prev) => [...prev, emptyEdu()])}
          >
            <Plus className="h-3.5 w-3.5" />
            Add education
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Work experience</p>
          {workExperience.map((row, i) => (
            <div
              key={i}
              className="relative space-y-2 rounded-[var(--radius)] border border-[var(--color-border)] p-3"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7 text-[var(--color-muted-foreground)]"
                onClick={() =>
                  setWorkExperience((prev) => prev.filter((_, j) => j !== i))
                }
                disabled={workExperience.length <= 1}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <div className="grid gap-2 pr-8">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    placeholder="Company"
                    value={row.company}
                    onChange={(e) =>
                      setWorkExperience((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, company: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <Input
                    placeholder="Position"
                    value={row.position}
                    onChange={(e) =>
                      setWorkExperience((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, position: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </div>
                <Input
                  placeholder="Period (e.g. 2020 — 2023)"
                  value={row.period}
                  onChange={(e) =>
                    setWorkExperience((prev) =>
                      prev.map((x, j) =>
                        j === i ? { ...x, period: e.target.value } : x,
                      ),
                    )
                  }
                />
                <textarea
                  className={cn(fieldClass, "min-h-[72px] resize-y")}
                  placeholder="Summary"
                  value={row.summary}
                  onChange={(e) =>
                    setWorkExperience((prev) =>
                      prev.map((x, j) =>
                        j === i ? { ...x, summary: e.target.value } : x,
                      ),
                    )
                  }
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setWorkExperience((prev) => [...prev, emptyWork()])}
          >
            <Plus className="h-3.5 w-3.5" />
            Add role
          </Button>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Projects</p>
          {projects.map((row, i) => (
            <div
              key={i}
              className="relative space-y-2 rounded-[var(--radius)] border border-[var(--color-border)] p-3"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7 text-[var(--color-muted-foreground)]"
                onClick={() =>
                  setProjects((prev) => prev.filter((_, j) => j !== i))
                }
                disabled={projects.length <= 1}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <div className="grid gap-2 pr-8">
                <Input
                  placeholder="Project name"
                  value={row.name}
                  onChange={(e) =>
                    setProjects((prev) =>
                      prev.map((x, j) =>
                        j === i ? { ...x, name: e.target.value } : x,
                      ),
                    )
                  }
                />
                <Input
                  placeholder="Your role"
                  value={row.role}
                  onChange={(e) =>
                    setProjects((prev) =>
                      prev.map((x, j) =>
                        j === i ? { ...x, role: e.target.value } : x,
                      ),
                    )
                  }
                />
                <Input
                  placeholder="Tech stack (comma-separated)"
                  value={
                    Array.isArray(row.techStack)
                      ? row.techStack.join(", ")
                      : ""
                  }
                  onChange={(e) =>
                    setProjects((prev) =>
                      prev.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              techStack: e.target.value
                                .split(",")
                                .map((t) => t.trim())
                                .filter(Boolean),
                            }
                          : x,
                      ),
                    )
                  }
                />
                <textarea
                  className={cn(fieldClass, "min-h-[64px] resize-y")}
                  placeholder="Highlights"
                  value={row.highlights}
                  onChange={(e) =>
                    setProjects((prev) =>
                      prev.map((x, j) =>
                        j === i ? { ...x, highlights: e.target.value } : x,
                      ),
                    )
                  }
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setProjects((prev) => [...prev, emptyProject()])}
          >
            <Plus className="h-3.5 w-3.5" />
            Add project
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
