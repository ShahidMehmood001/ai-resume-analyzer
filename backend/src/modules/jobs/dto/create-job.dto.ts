import { IsString, IsOptional, IsArray, IsNumber } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateJobDto {
  @ApiProperty({ example: "Senior Full Stack Engineer" })
  @IsString()
  title: string;

  @ApiProperty({ example: "We are looking for a full stack engineer with 3+ years experience in React and Node.js..." })
  @IsString()
  description: string;

  @ApiProperty({ type: [String], example: ["React", "TypeScript", "Node.js", "PostgreSQL"] })
  @IsArray()
  @IsString({ each: true })
  requiredSkills: string[];

  @ApiPropertyOptional({ type: [String], example: ["GraphQL", "Docker", "Redis"] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  bonusSkills?: string[];

  @ApiPropertyOptional({ example: 3 })
  @IsNumber()
  @IsOptional()
  experienceYears?: number;

  @ApiPropertyOptional({ example: "Bachelor's or above" })
  @IsString()
  @IsOptional()
  educationLevel?: string;
}
