import OpenAI from "openai";
import { z } from "zod";
import type { StructuredRequest } from "./types";

// Override with OPENAI_MODEL; the model must accept PDF/image input for document reading.
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
let client: OpenAI | null = null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function openaiGenerate<S extends z.ZodType>(req: StructuredRequest<S>): Promise<z.infer<S>> {
    if (!process.env.OPENAI_API_KEY) throw new Error("AI is not set up: OPENAI_API_KEY is missing.");
    client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const content: OpenAI.Responses.ResponseInputContent[] = [];
    if (req.file) {
        const dataUrl = `data:${req.file.mimeType};base64,${req.file.base64}`;
        content.push(
            req.file.mimeType === "application/pdf"
                ? { type: "input_file", filename: "document.pdf", file_data: dataUrl }
                : { type: "input_image", image_url: dataUrl, detail: "high" }
        );
    }
    content.push({ type: "input_text", text: req.text });

    for (let attempt = 0; ; attempt++) {
        try {
            const response = await client.responses.create({
                model: MODEL,
                instructions: req.system,
                input: [{ role: "user", content }],
                max_output_tokens: req.maxTokens ?? 16000,
                text: {
                    format: {
                        type: "json_schema",
                        name: "result",
                        schema: z.toJSONSchema(req.schema) as Record<string, unknown>,
                        strict: false,
                    },
                },
            });
            if (!response.output_text) throw new Error("The AI returned an empty response. Please try again.");
            return req.schema.parse(JSON.parse(response.output_text));
        } catch (err) {
            if (err instanceof OpenAI.APIError) {
                if (err.status === 429 && attempt < 2) {
                    await sleep(10000 * (attempt + 1));
                    continue;
                }
                if (err.status === 429) throw new Error("AI rate limit or quota reached. Check the OpenAI account billing, then try again.");
                if (err.status === 401) throw new Error("AI is not set up: the OPENAI_API_KEY is invalid.");
                if (err.status === 403 || err.status === 404) {
                    throw new Error(`AI key has no access to the model "${MODEL}". Check OPENAI_MODEL.`);
                }
            }
            if (err instanceof SyntaxError || err instanceof z.ZodError) {
                throw new Error("The AI response was not in the expected format. Please try again.");
            }
            throw err;
        }
    }
}
