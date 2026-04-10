import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Resume } from "./entities/resume.entity";
import { ResumeScore } from "./entities/resume-score.entity";
import { Candidate } from "../candidates/entities/candidate.entity";
import { ResumesService } from "./resumes.service";
import { ResumesController } from "./resumes.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Resume, ResumeScore, Candidate])],
  providers: [ResumesService],
  controllers: [ResumesController],
  exports: [ResumesService],
})
export class ResumesModule {}
