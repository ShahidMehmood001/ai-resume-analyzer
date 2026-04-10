import { IsOptional, IsString, IsEnum, IsArray, IsNumber } from "class-validator";
import { CandidateStatus } from "../entities/candidate.entity";

export class UpdateCandidateDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsEnum(CandidateStatus) status?: CandidateStatus;
  @IsOptional() @IsNumber() overallScore?: number;
  @IsOptional() @IsArray() skills?: string[];
  @IsOptional() education?: any[];
  @IsOptional() workExperience?: any[];
  @IsOptional() projects?: any[];
}
