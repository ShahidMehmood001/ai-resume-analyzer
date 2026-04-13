import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AiService } from "./ai.service";
import { GeminiProvider } from "./providers/gemini.provider";
import { OpenAIProvider } from "./providers/openai.provider";
import { ZhipuProvider } from "./providers/zhipu.provider";

@Module({
  imports: [ConfigModule],
  providers: [
    GeminiProvider,
    OpenAIProvider,
    ZhipuProvider,
    {
      provide: "AI_PROVIDER",
      useFactory: (
        config: ConfigService,
        gemini: GeminiProvider,
        openai: OpenAIProvider,
        zhipu: ZhipuProvider,
      ) => {
        const provider = config.get<string>("AI_PROVIDER", "gemini").toLowerCase();
        if (provider === "openai") return openai;
        if (provider === "zhipu") return zhipu;
        return gemini; // default
      },
      inject: [ConfigService, GeminiProvider, OpenAIProvider, ZhipuProvider],
    },
    AiService,
  ],
  exports: [AiService],
})
export class AiModule {}
