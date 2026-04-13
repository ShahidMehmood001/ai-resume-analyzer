"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  AlertCircle, CheckCircle2, FileText, Loader2, Upload, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { resumesApi } from "@/lib/api";
import { toast } from "sonner";

interface FileItem {
  id: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  resumeId?: string;
  error?: string;
}

interface DropzoneProps {
  onUploaded?: (resumeIds: string[]) => void;
}

export function Dropzone({ onUploaded }: DropzoneProps) {
  const [items, setItems] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const next: FileItem[] = accepted.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      status: "pending",
      progress: 0,
    }));
    setItems((prev) => [...prev, ...next].slice(0, 10));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
    disabled: uploading,
  });

  const remove = (id: string) =>
    setItems((prev) => prev.filter((f) => f.id !== id));

  const upload = async () => {
    const pending = items.filter((f) => f.status === "pending");
    if (!pending.length) return;

    setUploading(true);
    setItems((prev) =>
      prev.map((f) =>
        f.status === "pending" ? { ...f, status: "uploading" } : f,
      ),
    );

    try {
      const result = await resumesApi.upload(
        pending.map((f) => f.file),
        (pct) =>
          setItems((prev) =>
            prev.map((f) =>
              f.status === "uploading" ? { ...f, progress: pct } : f,
            ),
          ),
      );

      const ids: string[] = [];
      result.files.forEach((r: { resumeId: string; filename: string }) => {
        ids.push(r.resumeId);
        setItems((prev) =>
          prev.map((f) =>
            f.file.name === r.filename
              ? { ...f, status: "done", progress: 100, resumeId: r.resumeId }
              : f,
          ),
        );
      });

      toast.success(`${ids.length} resume${ids.length > 1 ? "s" : ""} uploaded`);
      onUploaded?.(ids);
    } catch (err) {
      setItems((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error", error: (err as Error).message }
            : f,
        ),
      );
      toast.error("Upload failed: " + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const pendingCount = items.filter((f) => f.status === "pending").length;

  return (
    <div className="space-y-3">
      {/* Drop area */}
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)]",
          "border-2 border-dashed px-6 py-10 text-center transition-all duration-150",
          "cursor-pointer",
          isDragActive
            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 scale-[1.01]"
            : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-accent)]/40",
          uploading && "pointer-events-none opacity-50",
        )}
      >
        <input {...getInputProps()} />
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
          <Upload className="h-6 w-6 text-[var(--color-primary)]" />
        </span>
        <div>
          <p className="text-sm font-medium">
            {isDragActive ? "Release to upload" : "Drag & drop PDF files here"}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            or click to browse · PDF only · up to 10 files · 10 MB each
          </p>
        </div>
      </div>

      {/* File list */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius)] border px-3 py-2.5",
                "bg-[var(--color-card)] transition-colors",
                item.status === "error" && "border-red-500/30",
              )}
            >
              <FileText className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.file.name}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {(item.file.size / 1024).toFixed(0)} KB
                </p>
                {item.status === "uploading" && (
                  <Progress value={item.progress} className="mt-1" />
                )}
                {item.status === "error" && (
                  <p className="mt-0.5 text-xs text-red-500">{item.error}</p>
                )}
              </div>
              <div className="shrink-0">
                {item.status === "pending" && (
                  <button
                    onClick={() => remove(item.id)}
                    className="rounded p-0.5 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {item.status === "uploading" && (
                  <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
                )}
                {item.status === "done" && (
                  <CheckCircle2 className="h-4 w-4 text-[var(--color-score-high)]" />
                )}
                {item.status === "error" && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {pendingCount > 0 && (
        <Button
          className="w-full"
          onClick={upload}
          disabled={uploading}
        >
          {uploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
          ) : (
            <><Upload className="h-4 w-4" /> Upload {pendingCount} file{pendingCount > 1 ? "s" : ""}</>
          )}
        </Button>
      )}
    </div>
  );
}
