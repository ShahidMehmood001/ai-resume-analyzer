"use client";
import { Candidate } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./status-badge";
import { getScoreColor, getScoreBg } from "@/lib/utils";
import { Eye, MapPin, Mail } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
  const { selectedCandidates, toggleSelectCandidate } = useAppStore();
  const selected = selectedCandidates.includes(candidate.id);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md animate-fade-in",
        selected && "ring-2 ring-primary",
      )}
      onClick={() => toggleSelectCandidate(candidate.id)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
            {(candidate.name?.[0] ?? "?").toUpperCase()}
          </div>
          {candidate.overallScore != null && (
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm",
                getScoreBg(candidate.overallScore),
              )}
            >
              {candidate.overallScore.toFixed(0)}
            </div>
          )}
        </div>

        <h3 className="font-semibold truncate">{candidate.name || "Unknown"}</h3>

        {candidate.email && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <Mail className="w-3 h-3" /> {candidate.email}
          </p>
        )}
        {candidate.city && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {candidate.city}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mt-3">
          {candidate.skills?.slice(0, 4).map((s) => (
            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <StatusBadge candidateId={candidate.id} status={candidate.status} />
          <Link href={`/candidates/${candidate.id}`} onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
