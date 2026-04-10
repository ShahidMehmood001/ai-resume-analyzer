import {
  Controller, Get, Param, Delete, HttpCode, HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
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

  @Get(":id")
  @ApiOperation({ summary: "Get resume by ID (includes candidate and scores)" })
  @ApiParam({ name: "id", description: "Resume UUID" })
  @ApiResponse({ status: 404, description: "Not found" })
  findOne(@Param("id") id: string) {
    return this.resumesService.findOne(id);
  }
}
