import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import type { StructuredRequest } from "./types";

const MODEL = "claude-opus-5-5";
let client: Anthropic | null = null;

export async function claudeGenerate<S extends z.ZodType>(req: StructuredRequest<S>): Promise<z.infer<S>> {
    client ??= new Anthropic(); // reads ANTHROPIC_API_KEY

    const content: Anthropic.Beta.BetaContentBlockParam[] = [];
    if (req.file) {
        content.push(
            req.file.mimeType === "application/pdf"
                ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: req.file.base64 } }
                : { type: "image", source: { type: "base64", media_type: req.file.mimeType, data: req.file.base64 } }
        );
    }
    content.push({ type: "text", text: req.text });

    const response = await client.beta.messages
        .parse({
            model: MODEL,
            max_tokens: req.maxTokens ?? 16000,
            betas: ["server-side-fallback-2026-07-01"],
            fallbacks: "default",
            system: req.system,
            output_config: { effort: req.effort ?? "medium", format: betaZodOutputFormat(req.schema) },
            messages: [{ role: "user", content }],
        })
        .catch((err: unknown) => {
            // Turn setup/billing problems into messages an admin can act on.
            if (err instanceof Anthropic.AuthenticationError) {
                throw new Error("AI is not set up: the ANTHROPIC_API_KEY is missing or invalid.");
            }
            if (err instanceof Anthropic.PermissionDeniedError || (err instanceof Anthropic.BadRequestError && /credit/i.test(err.message))) {
                throw new Error("AI account has no credit or access. Check billing in the Claude Console.");
            }
            if (err instanceof Anthropic.RateLimitError) {
                throw new Error("AI is busy right now. Please try again in a minute.");
            }
            throw err;
        });

    if (response.stop_reason === "refusal") throw new Error("The AI declined to process this request.");
    if (response.stop_reason === "max_tokens" || !response.parsed_output) {
        throw new Error("The AI response was incomplete. Please try again.");
    }
    return response.parsed_output as z.infer<S>;
}
