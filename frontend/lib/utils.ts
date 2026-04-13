import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeDate(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = now - then;
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatDate(date);
}

// ── Score helpers ─────────────────────────────────────────────────────────────
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-[var(--color-score-high)]";
  if (score >= 60) return "text-[var(--color-score-mid)]";
  return "text-[var(--color-score-low)]";
}

export function getScoreBgClass(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export function getScoreHex(score: number): string {
  // Used for recharts fills — returns CSS variable string
  if (score >= 80) return "var(--color-score-high)";
  if (score >= 60) return "var(--color-score-mid)";
  return "var(--color-score-low)";
}

// ── Status helpers ────────────────────────────────────────────────────────────
export type CandidateStatusValue =
  | "pending"
  | "shortlisted"
  | "interviewing"
  | "hired"
  | "rejected";

interface StatusMeta {
  label: string;
  /** Tailwind text colour class using CSS variable */
  textClass: string;
  /** Dot colour for the status indicator */
  dotClass: string;
  /** Light bg pill — transparent with coloured border + text */
  pillClass: string;
}

const STATUS_MAP: Record<CandidateStatusValue, StatusMeta> = {
  pending: {
    label: "Pending",
    textClass: "text-[var(--color-status-pending-text)]",
    dotClass: "bg-slate-400",
    pillClass:
      "border-slate-300 text-[var(--color-status-pending-text)] dark:border-slate-600",
  },
  shortlisted: {
    label: "Shortlisted",
    textClass: "text-[var(--color-status-shortlisted-text)]",
    dotClass: "bg-blue-500",
    pillClass:
      "border-blue-300 text-[var(--color-status-shortlisted-text)] dark:border-blue-700",
  },
  interviewing: {
    label: "Interviewing",
    textClass: "text-[var(--color-status-interviewing-text)]",
    dotClass: "bg-violet-500",
    pillClass:
      "border-violet-300 text-[var(--color-status-interviewing-text)] dark:border-violet-700",
  },
  hired: {
    label: "Hired",
    textClass: "text-[var(--color-status-hired-text)]",
    dotClass: "bg-emerald-500",
    pillClass:
      "border-emerald-300 text-[var(--color-status-hired-text)] dark:border-emerald-700",
  },
  rejected: {
    label: "Rejected",
    textClass: "text-[var(--color-status-rejected-text)]",
    dotClass: "bg-red-500",
    pillClass:
      "border-red-300 text-[var(--color-status-rejected-text)] dark:border-red-700",
  },
};

export function getStatusMeta(status: string): StatusMeta {
  return (
    STATUS_MAP[status as CandidateStatusValue] ?? STATUS_MAP.pending
  );
}
