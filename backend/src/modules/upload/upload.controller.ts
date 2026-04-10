import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Param,
  Res,
  Logger,
  HttpException,
  HttpStatus,
  Get,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import {
  ApiConsumes,
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiProperty,
} from "@nestjs/swagger";
import { Response } from "express";
import { UploadService } from "./upload.service";

class UploadResumesDto {
  @ApiProperty({
    type: "array",
    items: { type: "string", format: "binary" },
    description: "PDF resume files (up to 10)",
  })
  files: Express.Multer.File[];
}

@ApiTags("upload")
@Controller("upload")
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post("resumes")
  @UseInterceptors(FilesInterceptor("files", 10))
  @ApiOperation({
    summary: "Batch upload PDF resumes",
    description:
      "Upload up to 10 PDF resumes at once. Each file is parsed in the background. Use the returned resumeId(s) to trigger SSE extraction.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "PDF resume files",
    type: UploadResumesDto,
  })
  @ApiResponse({
    status: 201,
    description: "Files accepted and queued for parsing",
    schema: {
      example: {
        uploaded: 2,
        files: [
          { resumeId: "uuid-1", filename: "john_doe.pdf", status: "processing" },
          { resumeId: "uuid-2", filename: "jane_smith.pdf", status: "processing" },
        ],
      },
    },
  })
  @ApiResponse({ status: 400, description: "No files uploaded or invalid format" })
  async uploadResumes(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new HttpException("No files uploaded", HttpStatus.BAD_REQUEST);
    }
    this.logger.log(`Received ${files.length} file(s) for upload`);
    return this.uploadService.processUploadedFiles(files);
  }

  @Post("resumes/:resumeId/extract")
  @ApiOperation({
    summary: "Stream AI extraction via SSE",
    description:
      "Opens a Server-Sent Events stream. The AI progressively extracts structured data from the parsed PDF text. Events: `start`, `chunk`, `complete`, `error`, `[DONE]`.",
  })
  @ApiParam({ name: "resumeId", description: "UUID returned from the upload endpoint" })
  @ApiResponse({
    status: 200,
    description: "SSE stream — text/event-stream",
    content: {
      "text/event-stream": {
        schema: {
          type: "string",
          example: "data: {type:start} ... data: {type:chunk} ... data: {type:complete} ... data: [DONE]",
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: "Resume not found or not yet parsed" })
  async streamExtract(
    @Param("resumeId") resumeId: string,
    @Res() res: Response,
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    try {
      await this.uploadService.streamAiExtraction(resumeId, res);
    } catch (err) {
      this.logger.error("SSE extraction failed", err);
      res.write(
        `data: ${JSON.stringify({ type: "error", message: "Extraction failed" })}

`,
      );
      res.end();
    }
  }

  @Get("resumes/:resumeId/status")
  @ApiOperation({ summary: "Poll resume processing status" })
  @ApiParam({ name: "resumeId", description: "Resume UUID" })
  @ApiResponse({
    status: 200,
    description: "Current status of the resume",
    schema: {
      example: { resumeId: "uuid", status: "done", candidateId: "uuid" },
    },
  })
  async getStatus(@Param("resumeId") resumeId: string) {
    return this.uploadService.getResumeStatus(resumeId);
  }
}
