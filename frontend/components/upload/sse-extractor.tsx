"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2,
} from "lucide-react";
import { resumesApi } from "@/lib/api";
import { type ExtractedResumeData } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ExtractionStatus = "connecting" | "streaming" | "done" | "error";

interface SSEExtractorProps {
  resumeId: string;
  onComplete?: (data: ExtractedResumeData) => void;
}

export function SSEExtractor({ resumeId, onComplete }: SSEExtractorProps) {
  const [status, setStatus] = useState<ExtractionStatus>("connecting");
  const [streamText, setStreamText] = useState("");
  const [extracted, setExtracted] = useState<ExtractedResumeData | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const es = resumesApi.streamExtract(resumeId);

    es.onopen = () => setStatus("streaming");

    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        setStatus("done");
        es.close();
        return;
      }
      try {
        const msg = JSON.parse(e.data) as {
          type: string;
          data?: { chunk?: string; extractedData?: ExtractedResumeData };
        };
        if (msg.type === "chunk") {
          setStreamText((p) => p + (msg.data?.chunk ?? ""));
          setStatus("streaming");
        }
        if (msg.type === "complete" && msg.data?.extractedData) {
          setExtracted(msg.data.extractedData);
          onComplete?.(msg.data.extractedData);
        }
        if (msg.type === "error") {
          setStatus("error");
          es.close();
        }
      } catch {
        // non-JSON frame, ignore
      }
    };

    es.onerror = () => {
      setStatus("error");
      es.close();
    };

    return () => es.close();
  }, [resumeId]);

  const statusConfig: Record<ExtractionStatus, { icon: React.ReactNode; label: string; badge: string }> = {
    connecting: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-muted-foreground)]" />,
      label: "Connecting…",
      badge: "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
    },
    streaming: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-primary)]" />,
      label: "Extracting…",
      badge: "bg-[var(--color-primary)]/15 text-[var(--color-primary)]",
    },
    done: {
      icon: <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-score-high)]" />,
      label: "Complete",
      badge: "bg-[var(--color-score-high)]/15 text-[var(--color-score-high)]",
    },
    error: {
      icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
      label: "Failed",
      badge: "bg-red-500/15 text-red-500",
    },
  };

  const cfg = statusConfig[status];

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      {/* Header */}
      <button
        className="flex w-full items-center justify-between px-4 py-3 bg-[var(--color-card)] hover:bg-[var(--color-accent)]/40 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-2.5">
          {cfg.icon}
          <span className="text-sm font-medium">AI Extraction</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", cfg.badge)}>
            {cfg.label}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-[var(--color-muted-foreground)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--color-muted-foreground)]" />
        )}
      </button>

      {/* Body */}
      {expanded && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-muted)]/20 p-4">
          {status === "done" && extracted ? (
            <div className="space-y-3 animate-fade-in">
              <ExtractedRow label="Name"  value={extracted.name} />
              <ExtractedRow label="Email" value={extracted.email} />
              <ExtractedRow label="Phone" value={extracted.phone} />
              <ExtractedRow label="City"  value={extracted.city} />
              {extracted.skills && extracted.skills.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs font-medium text-[var(--color-muted-foreground)]">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {extracted.skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-[10px]">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : status === "error" ? (
            <p className="text-xs text-red-500">
              Extraction failed. The resume has been saved — you can retry from the candidate page.
            </p>
          ) : (
            <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words font-mono text-[11px] text-[var(--color-muted-foreground)]">
              {streamText || "Waiting for response…"}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function ExtractedRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="w-10 shrink-0 text-[var(--color-muted-foreground)]">{label}</span>
      <span className="font-medium text-[var(--color-foreground)]">{value}</span>
    </div>
  );
}
