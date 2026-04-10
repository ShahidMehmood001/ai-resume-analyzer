import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { CandidatesModule } from "./modules/candidates/candidates.module";
import { ResumesModule } from "./modules/resumes/resumes.module";
import { JobsModule } from "./modules/jobs/jobs.module";
import { AiModule } from "./modules/ai/ai.module";
import { UploadModule } from "./modules/upload/upload.module";
import { Candidate } from "./modules/candidates/entities/candidate.entity";
import { Resume } from "./modules/resumes/entities/resume.entity";
import { Job } from "./modules/jobs/entities/job.entity";
import { ResumeScore } from "./modules/resumes/entities/resume-score.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env" }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        url: config.get<string>("DATABASE_URL"),
        entities: [Candidate, Resume, Job, ResumeScore],
        synchronize: config.get("NODE_ENV") !== "production",
        logging: config.get("NODE_ENV") === "development",
        ssl:
          config.get("NODE_ENV") === "production"
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),
    CandidatesModule,
    ResumesModule,
    JobsModule,
    AiModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
