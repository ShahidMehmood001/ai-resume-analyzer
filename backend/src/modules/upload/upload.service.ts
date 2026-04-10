import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Response } from "express";
import { ResumesService } from "../resumes/resumes.service";
import { AiService } from "../ai/ai.service";
import { ResumeStatus } from "../resumes/entities/resume.entity";

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(
    private readonly resumesService: ResumesService,
    private readonly aiService: AiService,
  ) {}

  async processUploadedFiles(files: Express.Multer.File[]) {
    const results = await Promise.all(
      files.map(async (file) => {
        const resume = await this.resumesService.createFromFile(file);
        this.resumesService.parseResumePdf(resume.id).catch((err) => {
          this.logger.error(`PDF parse failed for resume ${resume.id}`, err);
        });
        return {
          resumeId: resume.id,
          filename: file.originalname,
          status: "processing",
        };
      }),
    );
    return { uploaded: results.length, files: results };
  }

  async streamAiExtraction(resumeId: string, res: Response) {
    const resume = await this.resumesService.findOne(resumeId);
    if (!resume) throw new NotFoundException("Resume not found");

    // Wait up to 15s for PDF parsing to complete
    let attempts = 0;
    let rawText = resume.rawText;
    while (!rawText && attempts < 30) {
      await new Promise((r) => setTimeout(r, 500));
      const refreshed = await this.resumesService.findOne(resumeId);
      if (refreshed?.rawText) {
        rawText = refreshed.rawText;
        break;
      }
      if (refreshed?.status === ResumeStatus.FAILED) {
        throw new Error("PDF parsing failed");
      }
      attempts++;
    }

    if (!rawText) {
      throw new NotFoundException("Resume text not available — PDF may still be parsing");
    }

    const sendEvent = (type: string, data: unknown) => {
      res.write("data: " + JSON.stringify({ type, data }) + "\n\n");
    };

    await this.resumesService.updateStatus(
      resumeId,
      ResumeStatus.EXTRACTING,
      null,
    );
    sendEvent("start", { resumeId });
    try {
      const extractedData = await this.aiService.streamExtractResumeData(
        rawText,
        (chunk) => sendEvent("chunk", { chunk }),
      );

      await this.resumesService.saveExtractedData(resumeId, extractedData);
      await this.resumesService.updateStatus(resumeId, ResumeStatus.DONE, null);

      sendEvent("complete", { extractedData });
      res.write("data: [DONE]\n\n");
      res.end();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "AI extraction failed";
      this.logger.error(`AI extraction failed for resume ${resumeId}`, err);
      await this.resumesService.updateStatus(
        resumeId,
        ResumeStatus.FAILED,
        message,
      );
      sendEvent("error", { message });
      res.end();
    }
  }

  async getResumeStatus(resumeId: string) {
    const resume = await this.resumesService.findOne(resumeId);
    if (!resume) throw new NotFoundException("Resume not found");
    return {
      resumeId: resume.id,
      status: resume.status,
      candidateId: resume.candidateId ?? null,
      errorMessage: resume.errorMessage ?? null,
    };
  }
}
