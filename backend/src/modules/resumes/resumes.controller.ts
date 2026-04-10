import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { Controller, Get, Param, Delete, HttpCode } from "@nestjs/common";
import { ResumesService } from "./resumes.service";

@ApiTags("resumes")
@Controller("resumes")
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Get()
  @ApiOperation({ summary: "List all resumes" })
  findAll() { return this.resumesService.findAll(); }

  @Get(":id")
  @ApiOperation({ summary: "Get resume by ID" })
  findOne(@Param("id") id: string) { return this.resumesService.findOne(id); }
}
