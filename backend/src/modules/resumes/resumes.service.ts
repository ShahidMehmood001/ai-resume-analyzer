import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Resume, ResumeStatus } from "./entities/resume.entity";
import { ResumeScore } from "./entities/resume-score.entity";
import { Candidate } from "../candidates/entities/candidate.entity";
import { ExtractedResumeData } from "../ai/ai-provider.interface";
import { existsSync, readFileSync } from "fs";
import { basename, join } from "path";

// Safely import pdf-parse — handles both v1 (function) and v2 (class-based)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParseModule = require("pdf-parse");
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> =
  typeof pdfParseModule === "function"
    ? pdfParseModule
    : pdfParseModule.default ?? pdfParseModule.PDFParse
    ? async (buf: Buffer) => {
        const parser = new pdfParseModule.PDFParse();
        return parser.parse(buf);
      }
    : pdfParseModule;

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);

  /** Normalize line breaks and collapse noisy whitespace from PDF extraction. */
  static cleanPdfText(text: string): string {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[\t\f\v]+/g, " ")
      .replace(/ +/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  constructor(
    @InjectRepository(Resume) private resumeRepo: Repository<Resume>,
    @InjectRepository(ResumeScore) private scoreRepo: Repository<ResumeScore>,
    @InjectRepository(Candidate) private candidateRepo: Repository<Candidate>,
    private readonly config: ConfigService,
  ) {}

  async createFromFile(file: Express.Multer.File): Promise<Resume> {
    const candidate = this.candidateRepo.create({
      name: file.originalname.replace(/\.pdf$/i, ""),
    });
    await this.candidateRepo.save(candidate);

    const resume = this.resumeRepo.create({
      originalName: file.originalname,
      filePath: file.path,
      status: ResumeStatus.PARSING,
      candidate,
      candidateId: candidate.id,
    });
    return this.resumeRepo.save(resume);
  }

  async parseResumePdf(resumeId: string): Promise<void> {
    const resume = await this.resumeRepo.findOne({ where: { id: resumeId } });
    this.logger.log(`Resume =======> ${resumeId} found: ${JSON.stringify(resume)}`);
    if (!resume) return;

    try {
      const buffer = readFileSync(resume.filePath);
      const parsed = await pdfParse(buffer);
      resume.rawText = ResumesService.cleanPdfText(parsed.text);
      resume.status = ResumeStatus.EXTRACTING;
      await this.resumeRepo.save(resume);
      this.logger.log(`Parsed PDF for resume ${resumeId}`);
    } catch (err) {
      this.logger.error(`Failed to parse PDF ${resumeId}`, err);
      resume.status = ResumeStatus.FAILED;
      resume.errorMessage = (err as Error).message;
      await this.resumeRepo.save(resume);
    }
  }

  async saveExtractedData(resumeId: string, data: ExtractedResumeData): Promise<void> {
    const resume = await this.resumeRepo.findOne({
      where: { id: resumeId },
      relations: ["candidate"],
    });
    if (!resume?.candidate) return;

    const candidate = resume.candidate;
    if (data.name) candidate.name = data.name;
    if (data.email) candidate.email = data.email;
    if (data.phone) candidate.phone = data.phone;
    if (data.city) candidate.city = data.city;
    if (data.education) candidate.education = data.education;
    if (data.workExperience) candidate.workExperience = data.workExperience;
    if (data.skills) candidate.skills = data.skills;
    if (data.projects) candidate.projects = data.projects;
    await this.candidateRepo.save(candidate);
  }

  async updateStatus(
    resumeId: string,
    status: ResumeStatus,
    errorMessage: string | null = null,
  ): Promise<void> {
    await this.resumeRepo.update(resumeId, { status, errorMessage });
  }

  async findOne(id: string): Promise<Resume | null> {
    return this.resumeRepo.findOne({
      where: { id },
      relations: ["candidate", "scores"],
    });
  }

  /** Resolve absolute path to stored PDF on disk (multer stores file under UPLOAD_DIR). */
  resolvePdfAbsolutePath(resume: Resume): string | null {
    const uploadDir = this.config.get<string>("UPLOAD_DIR", "./uploads");
    const filename = basename(resume.filePath.replace(/\\/g, "/"));
    const absPath = join(process.cwd(), uploadDir, filename);
    if (!existsSync(absPath)) {
      this.logger.warn(`PDF not found at ${absPath}`);
      return null;
    }
    return absPath;
  }

  async findAll() {
    return this.resumeRepo.find({
      relations: ["candidate"],
      order: { createdAt: "DESC" },
    });
  }

  async saveScore(
    resumeId: string,
    jobId: string,
    scoreData: Omit<ResumeScore, "id" | "resume" | "job" | "createdAt">,
  ) {
    const score = this.scoreRepo.create({ ...scoreData, resumeId, jobId });
    return this.scoreRepo.save(score);
  }
}
