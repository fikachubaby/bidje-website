import type { z } from "zod";
import type { StructuredRequest } from "./types";
import { claudeGenerate } from "./claude";
import { geminiGenerate } from "./gemini";

export type { AiDocumentType, StructuredRequest } from "./types";

/**
 * One structured (JSON) AI call, validated against `schema`.
 * AI_PROVIDER picks the backend: "gemini" (default, free tier) or "anthropic" (paid).
 */
export function generateStructured<S extends z.ZodType>(req: StructuredRequest<S>): Promise<z.infer<S>> {
    return process.env.AI_PROVIDER === "anthropic" ? claudeGenerate(req) : geminiGenerate(req);
}
