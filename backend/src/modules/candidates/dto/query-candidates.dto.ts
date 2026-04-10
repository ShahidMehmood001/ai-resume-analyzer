import { IsOptional, IsString, IsEnum, IsNumberString } from "class-validator";
import { CandidateStatus } from "../entities/candidate.entity";

export class QueryCandidatesDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(CandidateStatus) status?: CandidateStatus;
  @IsOptional() @IsString() skill?: string;
  @IsOptional() @IsString() sortBy?: "overallScore" | "createdAt" | "name";
  @IsOptional() @IsString() order?: "ASC" | "DESC";
  @IsOptional() @IsNumberString() page?: string;
  @IsOptional() @IsNumberString() limit?: string;
}
