import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from "@nestjs/swagger";
import {
  Controller, Get, Post, Delete, Param, Body,
  HttpCode, HttpStatus,
} from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { CreateJobDto } from "./dto/create-job.dto";

@ApiTags("jobs")
@Controller("jobs")
export class JobsController {
  constructor(private readonly svc: JobsService) {}

  @Post()
  @ApiOperation({ summary: "Create a job description" })
  create(@Body() dto: CreateJobDto) { return this.svc.create(dto); }

  @Get()
  @ApiOperation({ summary: "List all jobs" })
  findAll() { return this.svc.findAll(); }

  @Get(":id")
  @ApiOperation({ summary: "Get job by ID" })
  findOne(@Param("id") id: string) { return this.svc.findOne(id); }

  @Post(":jobId/score/:candidateId")
  @ApiOperation({ summary: "Score a candidate against a job" })
  score(@Param("jobId") jobId: string, @Param("candidateId") candidateId: string) {
    return this.svc.scoreCandidate(jobId, candidateId);
  }

  @Post(":jobId/score-batch")
  @ApiOperation({ summary: "Score multiple candidates against a job" })
  scoreBatch(@Param("jobId") jobId: string, @Body() body: { candidateIds: string[] }) {
    return this.svc.scoreBatch(jobId, body.candidateIds);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a job" })
  remove(@Param("id") id: string) { return this.svc.remove(id); }
}
