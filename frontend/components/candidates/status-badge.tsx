"use client";
import { useState } from "react";
import { CandidateStatus } from "@/types";
import { getStatusColor, getStatusLabel } from "@/lib/utils";
import { candidatesApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const STATUSES: CandidateStatus[] = ["pending", "shortlisted", "interviewing", "hired", "rejected"];

interface Props {
  candidateId: string;
  status: CandidateStatus;
  onUpdate?: (status: CandidateStatus) => void;
}

export function StatusBadge({ candidateId, status, onUpdate }: Props) {
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);

  const change = async (newStatus: CandidateStatus) => {
    if (newStatus === current) return;
    setLoading(true);
    try {
      await candidatesApi.update(candidateId, { status: newStatus });
      setCurrent(newStatus);
      onUpdate?.(newStatus);
      toast.success(`Status updated to "${getStatusLabel(newStatus)}"`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select value={current} onValueChange={(v) => change(v as CandidateStatus)} disabled={loading}>
      <SelectTrigger className={cn("h-7 text-xs w-36 border-0", getStatusColor(current))}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            <span className={cn("text-xs font-medium", getStatusColor(s))}>
              {getStatusLabel(s)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
