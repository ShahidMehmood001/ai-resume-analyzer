import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AiService } from "./ai.service";
import { GeminiProvider } from "./providers/gemini.provider";
import { OpenAIProvider } from "./providers/openai.provider";

@Module({
  imports: [ConfigModule],
  providers: [
    GeminiProvider,
    OpenAIProvider,
    {
      provide: "AI_PROVIDER",
      useFactory: (config: ConfigService, gemini: GeminiProvider, openai: OpenAIProvider) => {
        const provider = config.get<string>("AI_PROVIDER", "gemini");
        return provider === "openai" ? openai : gemini;
      },
      inject: [ConfigService, GeminiProvider, OpenAIProvider],
    },
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}
