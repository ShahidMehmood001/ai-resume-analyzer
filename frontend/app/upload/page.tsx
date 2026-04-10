"use client";
import { useState } from "react";
import { Shell } from "@/components/layout/shell";
import { Dropzone } from "@/components/upload/dropzone";
import { SSEExtractor } from "@/components/upload/sse-extractor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

export default function UploadPage() {
  const [uploadedIds, setUploadedIds] = useState<string[]>([]);
  const [startExtract, setStartExtract] = useState(false);
  const router = useRouter();

  return (
    <Shell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Upload Resumes</h1>
        <p className="text-muted-foreground mt-1">Upload PDF resumes for AI-powered analysis</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Files</CardTitle>
          </CardHeader>
          <CardContent>
            <Dropzone
              onUploaded={(ids) => {
                setUploadedIds(ids);
                setStartExtract(false);
              }}
            />

            {uploadedIds.length > 0 && !startExtract && (
              <Button
                className="w-full mt-4"
                onClick={() => setStartExtract(true)}
              >
                Start AI Extraction ({uploadedIds.length} resumes)
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI Extraction Stream</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {startExtract && uploadedIds.length > 0 ? (
                uploadedIds.map((id) => (
                  <SSEExtractor key={id} resumeId={id} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
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
              <Users className="w-4 h-4" /> View All Candidates
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}
