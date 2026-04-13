"use client";

import { useState } from "react";
import { type CandidateStatus } from "@/types";
import { getStatusMeta } from "@/lib/utils";
import { candidatesApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES: CandidateStatus[] = [
  "pending",
  "shortlisted",
  "interviewing",
  "hired",
  "rejected",
];

interface StatusBadgeProps {
  candidateId: string;
  status: CandidateStatus;
  onUpdate?: (status: CandidateStatus) => void;
  /** Render as plain read-only pill (no dropdown) */
  readOnly?: boolean;
}

export function StatusBadge({
  candidateId,
  status,
  onUpdate,
  readOnly = false,
}: StatusBadgeProps) {
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);

  const meta = getStatusMeta(current);

  const handleChange = async (next: CandidateStatus) => {
    if (next === current) return;
    setLoading(true);
    try {
      await candidatesApi.update(candidateId, { status: next });
      setCurrent(next);
      onUpdate?.(next);
      toast.success(`Status → ${getStatusMeta(next).label}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  if (readOnly) {
    return <StatusPill status={current} />;
  }

  return (
    <Select
      value={current}
      onValueChange={(v) => handleChange(v as CandidateStatus)}
      disabled={loading}
    >
      <SelectTrigger
        className={cn(
          "h-7 w-[140px] border bg-transparent text-xs font-medium",
          "focus:ring-1",
          meta.pillClass,
        )}
      >
        <span className="flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", meta.dotClass)} />
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => {
          const m = getStatusMeta(s);
          return (
            <SelectItem key={s} value={s}>
              <span className="flex items-center gap-2">
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", m.dotClass)} />
                <span className={cn("text-xs font-medium", m.textClass)}>
                  {m.label}
                </span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

/** Standalone read-only status pill */
export function StatusPill({ status }: { status: string }) {
  const meta = getStatusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-xs font-medium bg-transparent",
        meta.pillClass,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", meta.dotClass)} />
      {meta.label}
    </span>
  );
}
