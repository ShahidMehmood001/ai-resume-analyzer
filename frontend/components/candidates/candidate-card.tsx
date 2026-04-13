"use client";

import Link from "next/link";
import { Eye, MapPin, Mail, Phone } from "lucide-react";
import { type Candidate } from "@/types";
import { cn, getScoreColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreRing } from "./score-chart";
import { StatusBadge } from "./status-badge";
import { useAppStore } from "@/store";

interface CandidateCardProps {
  candidate: Candidate;
}

export function CandidateCard({ candidate: c }: CandidateCardProps) {
  const { selectedCandidates, toggleSelectCandidate } = useAppStore();
  const selected = selectedCandidates.includes(c.id);

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--color-primary)]/30",
        selected && "ring-2 ring-[var(--color-primary)] border-[var(--color-primary)]/40",
      )}
      onClick={() => toggleSelectCandidate(c.id)}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-sm font-bold text-[var(--color-primary)]">
              {(c.name?.[0] ?? "?").toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-[var(--color-foreground)]">
                {c.name || "Unknown"}
              </p>
              <StatusBadge
                candidateId={c.id}
                status={c.status}
                readOnly
              />
            </div>
          </div>
          {c.overallScore != null && (
            <ScoreRing score={c.overallScore} size={44} />
          )}
        </div>

        {/* Contact */}
        <div className="space-y-1 mb-4">
          {c.email && (
            <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] truncate">
              <Mail className="h-3 w-3 shrink-0" />
              {c.email}
            </p>
          )}
          {c.phone && (
            <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
              <Phone className="h-3 w-3 shrink-0" />
              {c.phone}
            </p>
          )}
          {c.city && (
            <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
              <MapPin className="h-3 w-3 shrink-0" />
              {c.city}
            </p>
          )}
        </div>

        {/* Skills */}
        {c.skills && c.skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {c.skills.slice(0, 5).map((s) => (
              <Badge key={s} variant="secondary" className="text-[10px]">
                {s}
              </Badge>
            ))}
            {c.skills.length > 5 && (
              <Badge variant="outline" className="text-[10px]">
                +{c.skills.length - 5}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-[var(--color-border)] pt-3 mt-1">
          <Link
            href={`/candidates/${c.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
              <Eye className="h-3.5 w-3.5" />
              View profile
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
