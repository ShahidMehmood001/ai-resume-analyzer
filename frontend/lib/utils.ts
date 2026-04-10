import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-yellow-500";
  return "text-red-500";
}

export function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-zinc-500/20 text-zinc-400",
    shortlisted: "bg-blue-500/20 text-blue-400",
    interviewing: "bg-violet-500/20 text-violet-400",
    hired: "bg-emerald-500/20 text-emerald-400",
    rejected: "bg-red-500/20 text-red-400",
  };
  return map[status] ?? "bg-zinc-500/20 text-zinc-400";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    shortlisted: "Shortlisted",
    interviewing: "Interviewing",
    hired: "Hired",
    rejected: "Rejected",
  };
  return map[status] ?? status;
}
