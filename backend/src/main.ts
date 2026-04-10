import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { join } from "path";
import { mkdirSync } from "fs";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3001);
  const frontendUrl = configService.get<string>("FRONTEND_URL", "http://localhost:3000");

  // CORS — allow frontend origin
  app.enableCors({
    origin: [frontendUrl, "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  app.setGlobalPrefix("api");

  // Serve uploaded PDFs statically
  const uploadDir = configService.get("UPLOAD_DIR", "./uploads");
  mkdirSync(uploadDir, { recursive: true });
  app.useStaticAssets(join(process.cwd(), uploadDir), { prefix: "/uploads" });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger — with multipart/form-data support enabled
  const swaggerConfig = new DocumentBuilder()
    .setTitle("AI Resume Analyzer API")
    .setDescription(
      `## AI-powered resume analysis platform
      
**Upload** PDFs → **Parse** text → **Extract** structured data via AI (SSE streaming) → **Score** against job descriptions

### Quick Start
1. \`POST /api/upload/resumes\` — upload PDF files
2. \`POST /api/upload/resumes/{resumeId}/extract\` — stream AI extraction  
3. \`POST /api/jobs\` — create a job description
4. \`POST /api/jobs/{jobId}/score/{candidateId}\` — score candidate vs job
5. \`GET /api/candidates\` — list & filter candidates`,
    )
    .setVersion("1.0")
    .addTag("upload", "PDF upload, parsing and SSE AI extraction")
    .addTag("candidates", "Candidate management, filtering and comparison")
    .addTag("jobs", "Job description management and AI scoring")
    .addTag("resumes", "Resume records")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(port);
  logger.log(`🚀  API:     http://localhost:${port}/api`);
  logger.log(`📚  Swagger: http://localhost:${port}/api/docs`);
  logger.log(`🤖  AI:      ${configService.get("AI_PROVIDER", "gemini")}`);
}

bootstrap();
