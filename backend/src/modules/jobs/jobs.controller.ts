import {
  Controller, Get, Post, Delete, Param, Body,
  HttpCode, HttpStatus,
} from "@nestjs/common";
import {
  ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse,
} from "@nestjs/swagger";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";

@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  constructor(private readonly svc: JobsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new job description" })
  @ApiBody({ type: CreateJobDto })
  @ApiResponse({ status: 201, description: "Job created" })
  create(@Body() dto: CreateJobDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all job descriptions" })
  findAll() {
    return this.svc.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get job by ID" })
  @ApiParam({ name: "id", description: "Job UUID" })
  @ApiResponse({ status: 404, description: "Not found" })
  findOne(@Param("id") id: string) {
    return this.svc.findOne(id);
  }

  @Post(":jobId/score/:candidateId")
  @ApiOperation({
    summary: "Score a single candidate against a job",
    description: "Calls the AI model to produce overall, skillMatch, experienceRelevance and educationFit scores (0–100) plus an AI comment.",
  })
  @ApiParam({ name: "jobId", description: "Job UUID" })
  @ApiParam({ name: "candidateId", description: "Candidate UUID" })
  @ApiResponse({ status: 201, description: "Score result saved and returned" })
  score(
    @Param("jobId") jobId: string,
    @Param("candidateId") candidateId: string,
  ) {
    return this.svc.scoreCandidate(jobId, candidateId);
  }

  @Post(":jobId/score-batch")
  @ApiOperation({ summary: "Score multiple candidates against a job in parallel" })
  @ApiParam({ name: "jobId", description: "Job UUID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        candidateIds: {
          type: "array",
          items: { type: "string" },
          example: ["uuid-1", "uuid-2"],
        },
      },
    },
  })
  scoreBatch(
    @Param("jobId") jobId: string,
    @Body() body: { candidateIds: string[] },
  ) {
    return this.svc.scoreBatch(jobId, body.candidateIds);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a job description" })
  @ApiParam({ name: "id", description: "Job UUID" })
  remove(@Param("id") id: string) {
    return this.svc.remove(id);
  }
}
