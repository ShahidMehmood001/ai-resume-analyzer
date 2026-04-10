import {
  Controller, Post, UseInterceptors, UploadedFiles,
  Param, Res, Logger, HttpException, HttpStatus,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiBody, ApiTags, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import { UploadService } from "./upload.service";

@ApiTags("upload")
@Controller("upload")
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post("resumes")
  @UseInterceptors(FilesInterceptor("files", 10))
  @ApiConsumes("multipart/form-data")
  @ApiBody({ description: "Upload up to 10 PDF resumes" })
  @ApiOperation({ summary: "Batch upload PDF resumes" })
  async uploadResumes(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new HttpException("No files uploaded", HttpStatus.BAD_REQUEST);
    }
    this.logger.log(`Received ${files.length} file(s) for upload`);
    return this.uploadService.processUploadedFiles(files);
  }

  @Post("resumes/:resumeId/extract")
  @ApiOperation({ summary: "Stream AI extraction via SSE for a resume" })
  async streamExtract(@Param("resumeId") resumeId: string, @Res() res: Response) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    try {
      await this.uploadService.streamAiExtraction(resumeId, res);
    } catch (err) {
      this.logger.error("SSE extraction failed", err);
      res.write(`data: ${JSON.stringify({ type: "error", message: "Extraction failed" })}\n\n`);
      res.end();
    }
  }
}
