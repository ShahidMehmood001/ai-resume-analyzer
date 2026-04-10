"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { resumesApi } from "@/lib/api";
import { toast } from "sonner";

interface FileItem {
  file: File;
  id: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  resumeId?: string;
  error?: string;
}

export function Dropzone({ onUploaded }: { onUploaded?: (resumeIds: string[]) => void }) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: FileItem[] = accepted.map((f) => ({
      file: f,
      id: Math.random().toString(36).slice(2),
      status: "pending",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...newFiles].slice(0, 10));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 10,
    disabled: isUploading,
  });

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const upload = async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (!pending.length) return;

    setIsUploading(true);
    setFiles((prev) =>
      prev.map((f) => (f.status === "pending" ? { ...f, status: "uploading" } : f)),
    );

    try {
      const result = await resumesApi.upload(
        pending.map((f) => f.file),
        (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.status === "uploading" ? { ...f, progress } : f)),
          );
        },
      );

      const resumeIds: string[] = [];
      result.files.forEach((r: { resumeId: string; filename: string }) => {
        resumeIds.push(r.resumeId);
        setFiles((prev) =>
          prev.map((f) =>
            f.file.name === r.filename
              ? { ...f, status: "done", progress: 100, resumeId: r.resumeId }
              : f,
          ),
        );
      });

      toast.success(`${resumeIds.length} resume(s) uploaded successfully`);
      onUploaded?.(resumeIds);
    } catch (err) {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === "uploading"
            ? { ...f, status: "error", error: (err as Error).message }
            : f,
        ),
      );
      toast.error("Upload failed: " + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-accent/30",
          isUploading && "opacity-50 cursor-not-allowed",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-medium">
              {isDragActive ? "Drop files here" : "Drag & drop PDF resumes here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse · PDF only · Max 10 files · 10MB each
            </p>
          </div>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card animate-fade-in"
            >
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(item.file.size / 1024).toFixed(0)} KB
                </p>
                {item.status === "uploading" && (
                  <Progress value={item.progress} className="mt-1 h-1" />
                )}
                {item.status === "error" && (
                  <p className="text-xs text-red-400 mt-1">{item.error}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                {item.status === "pending" && (
                  <button onClick={() => removeFile(item.id)}>
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
                {item.status === "uploading" && (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                )}
                {item.status === "done" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                )}
                {item.status === "error" && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {files.some((f) => f.status === "pending") && (
        <Button onClick={upload} disabled={isUploading} className="w-full">
          {isUploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
          ) : (
            <><Upload className="w-4 h-4" /> Upload {files.filter((f) => f.status === "pending").length} File(s)</>
          )}
        </Button>
      )}
    </div>
  );
}
