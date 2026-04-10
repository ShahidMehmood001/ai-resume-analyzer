import { Injectable, Inject } from "@nestjs/common";
import { AIProvider, ExtractedResumeData, ScoreResult } from "./ai-provider.interface";

@Injectable()
export class AiService {
  constructor(@Inject("AI_PROVIDER") private readonly provider: AIProvider) {}

  async extractResumeData(text: string): Promise<ExtractedResumeData> {
    return this.provider.extractResumeData(text);
  }

  async streamExtractResumeData(
    text: string,
    onChunk: (chunk: string) => void,
  ): Promise<ExtractedResumeData> {
    return this.provider.streamExtractResumeData(text, onChunk);
  }

  async scoreResumeAgainstJob(
    resumeData: ExtractedResumeData,
    jobDescription: string,
    requiredSkills: string[],
    bonusSkills: string[],
  ): Promise<ScoreResult> {
    return this.provider.scoreResumeAgainstJob(resumeData, jobDescription, requiredSkills, bonusSkills);
  }
}
