import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { v4 as uuidv4 } from "uuid";
import { mkdirSync } from "fs";
import { UploadController } from "./upload.controller";
import { UploadService } from "./upload.service";
import { ResumesModule } from "../resumes/resumes.module";
import { AiModule } from "../ai/ai.module";

@Module({
  imports: [
    ConfigModule,
    ResumesModule,
    AiModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const uploadDir = config.get("UPLOAD_DIR", "./uploads");
        mkdirSync(uploadDir, { recursive: true });
        return {
          storage: diskStorage({
            destination: uploadDir,
            filename: (_req, file, cb) => {
              cb(null, `${uuidv4()}${extname(file.originalname)}`);
            },
          }),
          fileFilter: (_req, file, cb) => {
            if (file.mimetype !== "application/pdf") {
              return cb(new Error("Only PDF files are allowed"), false);
            }
            cb(null, true);
          },
          limits: {
            fileSize: parseInt(config.get("MAX_FILE_SIZE_MB", "10")) * 1024 * 1024,
            files: parseInt(config.get("MAX_FILES_PER_BATCH", "10")),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
