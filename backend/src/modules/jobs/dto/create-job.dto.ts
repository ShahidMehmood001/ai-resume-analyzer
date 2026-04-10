import { IsString, IsOptional, IsArray, IsNumber } from "class-validator";

export class CreateJobDto {
  @IsString() title: string;
  @IsString() description: string;
  @IsArray() @IsString({ each: true }) requiredSkills: string[];
  @IsArray() @IsString({ each: true }) @IsOptional() bonusSkills?: string[];
  @IsNumber() @IsOptional() experienceYears?: number;
  @IsString() @IsOptional() educationLevel?: string;
}
