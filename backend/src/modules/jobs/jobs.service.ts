import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Job } from "./entities/job.entity";
import { ResumeScore } from "../resumes/entities/resume-score.entity";
import { Resume } from "../resumes/entities/resume.entity";
import { Candidate } from "../candidates/entities/candidate.entity";
import { AiService } from "../ai/ai.service";
import { CreateJobDto } from "./dto/create-job.dto";

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job) private jobRepo: Repository<Job>,
    @InjectRepository(ResumeScore) private scoreRepo: Repository<ResumeScore>,
    @InjectRepository(Resume) private resumeRepo: Repository<Resume>,
    @InjectRepository(Candidate) private candidateRepo: Repository<Candidate>,
    private readonly aiService: AiService,
  ) {}

  async create(dto: CreateJobDto): Promise<Job> {
    const job = this.jobRepo.create({ ...dto, bonusSkills: dto.bonusSkills ?? [] });
    return this.jobRepo.save(job);
  }

  async findAll(): Promise<Job[]> {
    return this.jobRepo.find({ order: { createdAt: "DESC" } });
  }

  async findOne(id: string): Promise<Job> {
    const j = await this.jobRepo.findOne({ where: { id }, relations: ["scores"] });
    if (!j) throw new NotFoundException(`Job ${id} not found`);
    return j;
  }

  async scoreCandidate(jobId: string, candidateId: string): Promise<ResumeScore> {
    const job = await this.findOne(jobId);
    const candidate = await this.candidateRepo.findOne({ where: { id: candidateId }, relations: ["resumes"] });
    if (!candidate) throw new NotFoundException("Candidate not found");

    const resume = candidate.resumes?.[0];
    if (!resume) throw new NotFoundException("No resume found for candidate");

    const scoreData = await this.aiService.scoreResumeAgainstJob(
      {
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        city: candidate.city,
        education: candidate.education,
        workExperience: candidate.workExperience,
        skills: candidate.skills,
        projects: candidate.projects,
      },
      job.description,
      job.requiredSkills,
      job.bonusSkills,
    );

    // Update candidate overall score
    candidate.overallScore = scoreData.overallScore;
    await this.candidateRepo.save(candidate);

    const existing = await this.scoreRepo.findOne({ where: { resumeId: resume.id, jobId } });
    if (existing) {
      Object.assign(existing, scoreData);
      return this.scoreRepo.save(existing);
    }

    const score = this.scoreRepo.create({ ...scoreData, resumeId: resume.id, jobId });
    return this.scoreRepo.save(score);
  }

  async scoreBatch(jobId: string, candidateIds: string[]): Promise<ResumeScore[]> {
    return Promise.all(candidateIds.map((id) => this.scoreCandidate(jobId, id)));
  }

  async remove(id: string): Promise<void> {
    const job = await this.findOne(id);
    await this.jobRepo.remove(job);
  }
}
