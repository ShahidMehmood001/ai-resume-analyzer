import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from "@nestjs/swagger";
import {
  Controller, Get, Patch, Delete, Param, Body, Query,
  HttpCode, HttpStatus, Post,
} from "@nestjs/common";
import { CandidatesService } from "./candidates.service";
import { QueryCandidatesDto } from "./dto/query-candidates.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";

@ApiTags("candidates")
@Controller("candidates")
export class CandidatesController {
  constructor(private readonly svc: CandidatesService) {}

  @Get()
  @ApiOperation({ summary: "List candidates with filtering, sorting, pagination" })
  findAll(@Query() query: QueryCandidatesDto) { return this.svc.findAll(query); }

  @Get("compare")
  @ApiOperation({ summary: "Compare 2-3 candidates side by side" })
  compare(@Query("ids") ids: string) {
    return this.svc.compareMultiple(ids.split(",").slice(0, 3));
  }

  @Get(":id")
  @ApiOperation({ summary: "Get candidate detail" })
  findOne(@Param("id") id: string) { return this.svc.findOne(id); }

  @Patch(":id")
  @ApiOperation({ summary: "Update candidate info or status" })
  update(@Param("id") id: string, @Body() dto: UpdateCandidateDto) {
    return this.svc.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete candidate" })
  remove(@Param("id") id: string) { return this.svc.remove(id); }
}
