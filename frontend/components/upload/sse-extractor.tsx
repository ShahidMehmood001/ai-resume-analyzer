"use client";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { resumesApi } from "@/lib/api";
import { ExtractedResumeData } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  resumeId: string;
  onComplete?: (data: ExtractedResumeData) => void;
}

export function SSEExtractor({ resumeId, onComplete }: Props) {
  const [status, setStatus] = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [chunks, setChunks] = useState("");
  const [extracted, setExtracted] = useState<ExtractedResumeData | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setStatus("streaming");
    const es = resumesApi.streamExtract(resumeId);

    es.onmessage = (e) => {
      if (e.data === "[DONE]") {
        setStatus("done");
        es.close();
        return;
      }
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "chunk") setChunks((p) => p + (msg.data?.chunk ?? ""));
        if (msg.type === "complete") {
          setExtracted(msg.data.extractedData);
          onComplete?.(msg.data.extractedData);
        }
        if (msg.type === "error") { setStatus("error"); es.close(); }
      } catch {}
    };

    es.onerror = () => { setStatus("error"); es.close(); };
    return () => es.close();
  }, [resumeId]);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div
        className="flex items-center justify-between p-3 bg-card cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-2">
          {status === "streaming" && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          {status === "done" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          <span className="text-sm font-medium">AI Extraction</span>
          <Badge variant={status === "done" ? "default" : "secondary"} className="text-xs">
            {status}
          </Badge>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {expanded && (
        <div className="p-3 bg-muted/30 border-t border-border">
          {status === "streaming" && (
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
              {chunks || "Waiting for response…"}
            </pre>
          )}
          {status === "done" && extracted && (
            <div className="space-y-2 text-sm animate-fade-in">
              <Row label="Name" value={extracted.name} />
              <Row label="Email" value={extracted.email} />
              <Row label="Phone" value={extracted.phone} />
              <Row label="City" value={extracted.city} />
              {extracted.skills && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {extracted.skills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-16 flex-shrink-0">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
