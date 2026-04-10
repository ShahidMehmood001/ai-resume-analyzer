import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, ExtractedResumeData, ScoreResult } from '../ai-provider.interface';

@Injectable()
export class GeminiProvider implements AIProvider {
  private readonly logger = new Logger(GeminiProvider.name);
  private readonly client: GoogleGenerativeAI;
  private readonly model: string;

  constructor(private config: ConfigService) {
    this.client = new GoogleGenerativeAI(config.get('GEMINI_API_KEY')!);
    this.model = config.get('GEMINI_MODEL', 'gemini-1.5-flash');
  }

  async extractResumeData(text: string): Promise<ExtractedResumeData> {
    const model = this.client.getGenerativeModel({ model: this.model });
    const prompt = this.buildExtractionPrompt(text);
    const result = await model.generateContent(prompt);
    return this.parseJSON<ExtractedResumeData>(result.response.text());
  }

  async streamExtractResumeData(
    text: string,
    onChunk: (chunk: string) => void,
  ): Promise<ExtractedResumeData> {
    const model = this.client.getGenerativeModel({ model: this.model });
    const prompt = this.buildExtractionPrompt(text);
    let fullText = "";
    let lastError: unknown = null;

    // Retry transient network failures before falling back to non-streaming.
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const stream = await model.generateContentStream(prompt);
        fullText = "";
        for await (const chunk of stream.stream) {
          const part = chunk.text();
          fullText += part;
          onChunk(part);
        }
        return this.parseJSON<ExtractedResumeData>(fullText);
      } catch (err) {
        lastError = err;
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Gemini stream extraction attempt ${attempt} failed: ${message}`,
        );
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    this.logger.warn(
      "Gemini stream extraction failed after retries, falling back to non-streaming extraction.",
    );
    try {
      const result = await model.generateContent(prompt);
      const fallbackText = result.response.text();
      onChunk(fallbackText);
      return this.parseJSON<ExtractedResumeData>(fallbackText);
    } catch (fallbackError) {
      const message =
        fallbackError instanceof Error
          ? fallbackError.message
          : "Gemini request failed";
      const rootCause =
        lastError instanceof Error
          ? lastError.message
          : fallbackError instanceof Error
            ? fallbackError.message
            : "unknown";
      throw new Error(
        `Gemini extraction failed (stream + fallback): ${message}. Root cause: ${rootCause}`,
      );
    }
  }

  async scoreResumeAgainstJob(
    resumeData: ExtractedResumeData,
    jobDescription: string,
    requiredSkills: string[],
    bonusSkills: string[],
  ): Promise<ScoreResult> {
    const model = this.client.getGenerativeModel({ model: this.model });
    const prompt = this.buildScoringPrompt(resumeData, jobDescription, requiredSkills, bonusSkills);
    const result = await model.generateContent(prompt);
    return this.parseJSON<ScoreResult>(result.response.text());
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
Required Skills: ${required.join(', ')}
Bonus Skills: ${bonus.join(', ')}
Candidate Data: ${JSON.stringify(resumeData, null, 2)}`;
  }

  private parseJSON<T>(text: string): T {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as T;
  }
}
