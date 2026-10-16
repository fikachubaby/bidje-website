import type { z } from "zod";

export type AiDocumentType = "application/pdf" | "image/jpeg" | "image/png" | "image/webp";

/** Provider-neutral request for one structured (JSON) answer. */
export interface StructuredRequest<S extends z.ZodType> {
    system: string;
    text: string;
    /** Optional PDF or image the model should read. */
    file?: { base64: string; mimeType: AiDocumentType };
    schema: S;
    effort?: "low" | "medium" | "high";
    maxTokens?: number;
}
