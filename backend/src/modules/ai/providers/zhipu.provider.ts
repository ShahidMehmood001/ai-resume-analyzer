import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { AIProvider, ExtractedResumeData, ScoreResult } from "../ai-provider.interface";

/**
 * Zhipu AI (智谱AI) provider — OpenAI-compatible API
 * Works in mainland China without VPN.
 * Free tier: 1M tokens on registration at https://open.bigmodel.cn
 * Models: glm-4-flash (free, fast), glm-4 (better quality)
 */
@Injectable()
export class ZhipuProvider implements AIProvider {
  private readonly logger = new Logger(ZhipuProvider.name);
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.client = new OpenAI({
      apiKey: config.get("ZHIPU_API_KEY") ?? "",
      baseURL: "https://open.bigmodel.cn/api/paas/v4/",
    });
    this.model = config.get("ZHIPU_MODEL", "glm-4-flash");
  }

  async extractResumeData(text: string): Promise<ExtractedResumeData> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: this.buildExtractionPrompt(text) }],
    });
    return this.parseJSON<ExtractedResumeData>(
      completion.choices[0].message.content ?? "{}",
    );
  }

  async streamExtractResumeData(
    text: string,
    onChunk: (chunk: string) => void,
  ): Promise<ExtractedResumeData> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: this.buildExtractionPrompt(text) }],
      stream: true,
    });

    let fullText = "";
    for await (const chunk of stream) {
      const part = chunk.choices[0]?.delta?.content ?? "";
      fullText += part;
      if (part) onChunk(part);
    }
    return this.parseJSON<ExtractedResumeData>(fullText);
  }

  async scoreResumeAgainstJob(
    resumeData: ExtractedResumeData,
    jobDescription: string,
    requiredSkills: string[],
    bonusSkills: string[],
  ): Promise<ScoreResult> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: "user",
          content: this.buildScoringPrompt(
            resumeData,
            jobDescription,
            requiredSkills,
            bonusSkills,
          ),
        },
      ],
    });
    return this.parseJSON<ScoreResult>(
      completion.choices[0].message.content ?? "{}",
    );
  }

  private buildExtractionPrompt(text: string): string {
    return `You are an expert resume parser. Extract structured information from the following resume text.
Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "city": "string or null",
  "education": [{ "school": "string", "major": "string", "degree": "string", "graduationDate": "string" }],
  "workExperience": [{ "company": "string", "position": "string", "period": "string", "summary": "string" }],
  "skills": ["string"],
  "projects": [{ "name": "string", "techStack": ["string"], "role": "string", "highlights": "string" }]
}

Resume text:
${text}`;
  }

  private buildScoringPrompt(
    resumeData: ExtractedResumeData,
    jd: string,
    required: string[],
    bonus: string[],
  ): string {
    return `You are a senior technical recruiter. Score this candidate against the job description.
Return ONLY valid JSON (no markdown, no explanation):
{
  "overallScore": <0-100>,
  "skillMatch": <0-100>,
  "experienceRelevance": <0-100>,
  "educationFit": <0-100>,
  "aiComment": "2-3 sentences on strengths and gaps"
}

Job Description: ${jd}
Required Skills: ${required.join(", ")}
Bonus Skills: ${bonus.join(", ")}
Candidate Data: ${JSON.stringify(resumeData, null, 2)}`;
  }

  private parseJSON<T>(text: string): T {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as T;
  }
}
