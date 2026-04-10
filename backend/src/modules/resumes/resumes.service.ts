import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Resume, ResumeStatus } from "./entities/resume.entity";
import { ResumeScore } from "./entities/resume-score.entity";
import { Candidate } from "../candidates/entities/candidate.entity";
import { ExtractedResumeData } from "../ai/ai-provider.interface";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse");
import { readFileSync } from "fs";

@Injectable()
export class ResumesService {
  private readonly logger = new Logger(ResumesService.name);

  constructor(
    @InjectRepository(Resume) private resumeRepo: Repository<Resume>,
    @InjectRepository(ResumeScore) private scoreRepo: Repository<ResumeScore>,
    @InjectRepository(Candidate) private candidateRepo: Repository<Candidate>,
  ) {}

  async createFromFile(file: Express.Multer.File): Promise<Resume> {
    const candidate = this.candidateRepo.create({ name: file.originalname.replace(".pdf", "") });
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
    if (!resume) return;

    try {
      const buffer = readFileSync(resume.filePath);
      const parsed = await pdfParse(buffer);
      resume.rawText = parsed.text;
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
    const resume = await this.resumeRepo.findOne({ where: { id: resumeId }, relations: ["candidate"] });
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

  async updateStatus(resumeId: string, status: ResumeStatus): Promise<void> {
    await this.resumeRepo.update(resumeId, { status });
  }

  async findOne(id: string): Promise<Resume | null> {
    return this.resumeRepo.findOne({ where: { id }, relations: ["candidate", "scores"] });
  }

  async findAll() {
    return this.resumeRepo.find({ relations: ["candidate"], order: { createdAt: "DESC" } });
  }

  async saveScore(resumeId: string, jobId: string, scoreData: Omit<ResumeScore, "id" | "resume" | "job" | "createdAt">) {
    const score = this.scoreRepo.create({ ...scoreData, resumeId, jobId });
    return this.scoreRepo.save(score);
  }
}
