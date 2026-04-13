"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Shell } from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropzone } from "@/components/upload/dropzone";
import { SSEExtractor } from "@/components/upload/sse-extractor";

export default function UploadPage() {
  const router = useRouter();
  const [uploadedIds, setUploadedIds] = useState<string[]>([]);
  const [extracting, setExtracting] = useState(false);

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Upload Resumes</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Upload PDF resumes for AI-powered parsing and extraction. Each file shows a first-page thumbnail before upload.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Upload zone */}
        <Card>
          <CardHeader>
            <CardTitle>Select files</CardTitle>
          </CardHeader>
          <CardContent>
            <Dropzone
              onUploaded={(ids) => {
                setUploadedIds(ids);
                setExtracting(false);
              }}
            />

            {uploadedIds.length > 0 && !extracting && (
              <Button
                className="mt-4 w-full"
                onClick={() => setExtracting(true)}
              >
                Start AI Extraction ({uploadedIds.length}{" "}
                {uploadedIds.length === 1 ? "resume" : "resumes"})
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Extraction panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Extraction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {extracting && uploadedIds.length > 0 ? (
                uploadedIds.map((id) => <SSEExtractor key={id} resumeId={id} />)
              ) : (
                <p className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
                  Upload resumes to begin AI extraction
                </p>
              )}
            </CardContent>
          </Card>

          {uploadedIds.length > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/candidates")}
            >
              <Users className="h-4 w-4" />
              View all candidates
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}
