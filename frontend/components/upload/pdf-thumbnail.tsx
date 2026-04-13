"use client";

import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { renderPdfFirstPageDataUrl } from "@/lib/pdf-thumbnail";

export function PdfThumbnail({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    setFailed(false);
    renderPdfFirstPageDataUrl(file)
      .then((u) => {
        if (!cancelled) {
          if (u) setUrl(u);
          else setFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  if (url) {
    return (
      <img
        src={url}
        alt=""
        className="h-14 w-11 shrink-0 rounded border border-[var(--color-border)] bg-white object-cover shadow-sm"
      />
    );
  }
  if (failed) {
    return <FileText className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />;
  }
  return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--color-muted-foreground)]" />;
}
