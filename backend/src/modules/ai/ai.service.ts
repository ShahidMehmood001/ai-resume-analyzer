import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AIProvider, ExtractedResumeData, ScoreResult } from "./ai-provider.interface";
import { OpenAIProvider } from "./providers/openai.provider";
import { GeminiProvider } from "./providers/gemini.provider";

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly geminiProvider: GeminiProvider,
    private readonly openAiProvider: OpenAIProvider,
    private readonly config: ConfigService,
  ) {}

  private hasUsableKey(key: string): boolean {
    return Boolean(key) && !key.startsWith("your_") && !key.endsWith("_here");
  }

  private hasGeminiKey(): boolean {
    return this.hasUsableKey(this.config.get<string>("GEMINI_API_KEY", ""));
  }

  private hasOpenAIKey(): boolean {
    return this.hasUsableKey(this.config.get<string>("OPENAI_API_KEY", ""));
  }

  private getPrimaryAndFallbackProviders(): {
    primaryName: "gemini" | "openai";
    primary: AIProvider;
    fallbackName: "gemini" | "openai" | null;
    fallback: AIProvider | null;
  } {
    const configured = this.config.get<string>("AI_PROVIDER", "gemini");
    const preferOpenAI = configured === "openai";
    const geminiReady = this.hasGeminiKey();
    const openaiReady = this.hasOpenAIKey();

    if (preferOpenAI) {
      if (openaiReady) {
        return {
          primaryName: "openai",
          primary: this.openAiProvider,
          fallbackName: geminiReady ? "gemini" : null,
          fallback: geminiReady ? this.geminiProvider : null,
        };
      }
      return {
        primaryName: "gemini",
        primary: this.geminiProvider,
        fallbackName: null,
        fallback: null,
      };
    }

    if (geminiReady) {
      return {
        primaryName: "gemini",
        primary: this.geminiProvider,
        fallbackName: openaiReady ? "openai" : null,
        fallback: openaiReady ? this.openAiProvider : null,
      };
    }

    return {
      primaryName: "openai",
      primary: this.openAiProvider,
      fallbackName: null,
      fallback: null,
    };
  }

  private async runWithFallback<T>(
    operation: (provider: AIProvider) => Promise<T>,
    operationName: string,
  ): Promise<T> {
    const { primaryName, primary, fallbackName, fallback } =
      this.getPrimaryAndFallbackProviders();
    try {
      return await operation(primary);
    } catch (err) {
      if (!fallback || !fallbackName) throw err;
      this.logger.warn(
        `${operationName} failed on ${primaryName}, falling back to ${fallbackName}.`,
      );
      return operation(fallback);
    }
  }

  async extractResumeData(text: string): Promise<ExtractedResumeData> {
    return this.runWithFallback(
      (provider) => provider.extractResumeData(text),
      "AI extraction",
    );
  }

  async streamExtractResumeData(
    text: string,
    onChunk: (chunk: string) => void,
  ): Promise<ExtractedResumeData> {
    return this.runWithFallback(
      (provider) => provider.streamExtractResumeData(text, onChunk),
      "AI stream extraction",
    );
  }

  async scoreResumeAgainstJob(
    resumeData: ExtractedResumeData,
    jobDescription: string,
    requiredSkills: string[],
    bonusSkills: string[],
  ): Promise<ScoreResult> {
    return this.runWithFallback(
      (provider) =>
        provider.scoreResumeAgainstJob(
          resumeData,
          jobDescription,
          requiredSkills,
          bonusSkills,
        ),
      "AI scoring",
    );
  }
}
