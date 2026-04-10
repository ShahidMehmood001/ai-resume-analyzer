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
        // Trigger parsing in background
        this.resumesService.parseResumePdf(resume.id).catch((err) => {
          this.logger.error(`PDF parse failed for ${resume.id}`, err);
        });
        return { resumeId: resume.id, filename: file.originalname, status: "processing" };
      }),
    );
    return { uploaded: results.length, files: results };
  }

  async streamAiExtraction(resumeId: string, res: Response) {
    const resume = await this.resumesService.findOne(resumeId);
    if (!resume) throw new NotFoundException("Resume not found");
    if (!resume.rawText) throw new NotFoundException("Resume text not yet parsed");

    await this.resumesService.updateStatus(resumeId, ResumeStatus.EXTRACTING);

    const sendEvent = (type: string, data: unknown) => {
      res.write(`data: ${JSON.stringify({ type, data })}\n\n`);
    };

    sendEvent("start", { resumeId });

    let accumulated = "";
    const extractedData = await this.aiService.streamExtractResumeData(
      resume.rawText,
      (chunk) => {
        accumulated += chunk;
        sendEvent("chunk", { chunk });
      },
    );

    // Save extracted data to candidate
    await this.resumesService.saveExtractedData(resumeId, extractedData);
    await this.resumesService.updateStatus(resumeId, ResumeStatus.DONE);

    sendEvent("complete", { extractedData });
    res.write("data: [DONE]\n\n");
    res.end();
  }
}
