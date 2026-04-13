import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { Response } from "express";
import { createReadStream } from "fs";
import { ResumesService } from "./resumes.service";

@ApiTags("resumes")
@Controller("resumes")
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Get()
  @ApiOperation({ summary: "List all resumes" })
  findAll() {
    return this.resumesService.findAll();
  }

  @Get(":id/pdf")
  @ApiOperation({
    summary: "Stream original PDF file (for preview in browser)",
    description:
      "Returns application/pdf with Content-Disposition: inline. Use resume id from candidate.resumes[0].id.",
  })
  @ApiParam({ name: "id", description: "Resume UUID" })
  @ApiResponse({ status: 200, description: "PDF binary stream" })
  @ApiResponse({ status: 404, description: "Resume or file not found" })
  async streamPdf(@Param("id") id: string, @Res() res: Response) {
    const resume = await this.resumesService.findOne(id);
    if (!resume) throw new NotFoundException("Resume not found");
    const absPath = this.resumesService.resolvePdfAbsolutePath(resume);
    if (!absPath) throw new NotFoundException("PDF file missing on disk");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(resume.originalName)}"`,
    );
    res.setHeader("Cache-Control", "private, max-age=3600");
    createReadStream(absPath).pipe(res);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get resume by ID (includes candidate and scores)" })
  @ApiParam({ name: "id", description: "Resume UUID" })
  @ApiResponse({ status: 404, description: "Not found" })
  findOne(@Param("id") id: string) {
    return this.resumesService.findOne(id);
  }
}
