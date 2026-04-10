import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Job } from "./entities/job.entity";
import { JobsService } from "./jobs.service";
import { JobsController } from "./jobs.controller";
import { AiModule } from "../ai/ai.module";
import { ResumeScore } from "../resumes/entities/resume-score.entity";
import { Resume } from "../resumes/entities/resume.entity";
import { Candidate } from "../candidates/entities/candidate.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Job, ResumeScore, Resume, Candidate]), AiModule],
  providers: [JobsService],
  controllers: [JobsController],
  exports: [JobsService],
})
export class JobsModule {}
