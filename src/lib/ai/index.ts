import type { z } from "zod";
import type { StructuredRequest } from "./types";
import { claudeGenerate } from "./claude";
import { geminiGenerate } from "./gemini";
import { openaiGenerate } from "./openai";

export type { AiDocumentType, StructuredRequest } from "./types";

/**
 * One structured (JSON) AI call, validated against `schema`.
 * AI_PROVIDER picks the backend: "openai" (default, ChatGPT), "gemini" or "anthropic".
 */
export function generateStructured<S extends z.ZodType>(req: StructuredRequest<S>): Promise<z.infer<S>> {
    switch (process.env.AI_PROVIDER) {
        case "anthropic":
            return claudeGenerate(req);
        case "gemini":
            return geminiGenerate(req);
        default:
            return openaiGenerate(req);
    }
}
