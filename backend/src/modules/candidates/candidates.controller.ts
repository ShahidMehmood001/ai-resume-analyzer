import {
  Controller, Get, Patch, Delete, Param, Body, Query,
  HttpCode, HttpStatus, Post,
} from "@nestjs/common";
import {
  ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody,
} from "@nestjs/swagger";
import { CandidatesService } from "./candidates.service";
import { QueryCandidatesDto } from "./dto/query-candidates.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";

@ApiTags("candidates")
@Controller("candidates")
export class CandidatesController {
  constructor(private readonly svc: CandidatesService) {}

  @Get()
  @ApiOperation({ summary: "List candidates with filtering, sorting and pagination" })
  @ApiQuery({ name: "search", required: false, description: "Search by name, email, city" })
  @ApiQuery({ name: "status", required: false, enum: ["pending","shortlisted","interviewing","hired","rejected"] })
  @ApiQuery({ name: "skill", required: false, description: "Filter by skill tag" })
  @ApiQuery({ name: "sortBy", required: false, enum: ["createdAt","overallScore","name"] })
  @ApiQuery({ name: "order", required: false, enum: ["ASC","DESC"] })
  @ApiQuery({ name: "page", required: false, description: "Page number (default 1)" })
  @ApiQuery({ name: "limit", required: false, description: "Items per page (default 10)" })
  @ApiResponse({ status: 200, description: "Paginated candidate list" })
  findAll(@Query() query: QueryCandidatesDto) {
    return this.svc.findAll(query);
  }

  @Get("compare")
  @ApiOperation({ summary: "Compare 2–3 candidates side by side" })
  @ApiQuery({ name: "ids", description: "Comma-separated candidate UUIDs (max 3)", example: "uuid1,uuid2,uuid3" })
  compare(@Query("ids") ids: string) {
    return this.svc.compareMultiple(ids.split(",").slice(0, 3));
  }

  @Get(":id")
  @ApiOperation({ summary: "Get full candidate detail" })
  @ApiParam({ name: "id", description: "Candidate UUID" })
  @ApiResponse({ status: 200, description: "Candidate with resumes and scores" })
  @ApiResponse({ status: 404, description: "Not found" })
  findOne(@Param("id") id: string) {
    return this.svc.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update candidate info or pipeline status" })
  @ApiParam({ name: "id", description: "Candidate UUID" })
  @ApiBody({ type: UpdateCandidateDto })
  update(@Param("id") id: string, @Body() dto: UpdateCandidateDto) {
    return this.svc.update(id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete candidate and all associated data" })
  @ApiParam({ name: "id", description: "Candidate UUID" })
  @ApiResponse({ status: 204, description: "Deleted" })
  remove(@Param("id") id: string) {
    return this.svc.remove(id);
  }
}
