import { IsOptional, IsString, IsEnum, IsArray, IsNumber } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { CandidateStatus } from "../entities/candidate.entity";

export class UpdateCandidateDto {
  @ApiPropertyOptional({ example: "John Doe" })
  @IsOptional() @IsString() name?: string;

  @ApiPropertyOptional({ example: "john@example.com" })
  @IsOptional() @IsString() email?: string;

  @ApiPropertyOptional({ example: "+1 555 0100" })
  @IsOptional() @IsString() phone?: string;

  @ApiPropertyOptional({ example: "San Francisco" })
  @IsOptional() @IsString() city?: string;

  @ApiPropertyOptional({ enum: CandidateStatus, example: "shortlisted" })
  @IsOptional() @IsEnum(CandidateStatus) status?: CandidateStatus;

  @ApiPropertyOptional({ example: 85.5 })
  @IsOptional() @IsNumber() overallScore?: number;

  @ApiPropertyOptional({ type: [String], example: ["React", "TypeScript"] })
  @IsOptional() @IsArray() skills?: string[];

  @ApiPropertyOptional({ type: "array" })
  @IsOptional() education?: any[];

  @ApiPropertyOptional({ type: "array" })
  @IsOptional() workExperience?: any[];

  @ApiPropertyOptional({ type: "array" })
  @IsOptional() projects?: any[];
}
