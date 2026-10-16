import { ApiError, GoogleGenAI } from "@google/genai";
import { z } from "zod";
import type { StructuredRequest } from "./types";

// Free-tier friendly default; override with GEMINI_MODEL.
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
let client: GoogleGenAI | null = null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function geminiGenerate<S extends z.ZodType>(req: StructuredRequest<S>): Promise<z.infer<S>> {
    if (!process.env.GEMINI_API_KEY) throw new Error("AI is not set up: GEMINI_API_KEY is missing.");
    client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const parts = [
        ...(req.file ? [{ inlineData: { mimeType: req.file.mimeType, data: req.file.base64 } }] : []),
        { text: req.text },
    ];

    // The free tier allows only a few requests per minute, so back off and retry on 429.
    for (let attempt = 0; ; attempt++) {
        try {
            const response = await client.models.generateContent({
                model: MODEL,
                contents: [{ role: "user", parts }],
                config: {
                    systemInstruction: req.system,
                    responseMimeType: "application/json",
                    responseJsonSchema: z.toJSONSchema(req.schema),
                    maxOutputTokens: req.maxTokens ?? 16000,
                },
            });
            if (!response.text) throw new Error("The AI returned an empty response. Please try again.");
            return req.schema.parse(JSON.parse(response.text));
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.status === 429 && attempt < 2) {
                    await sleep(20000 * (attempt + 1));
                    continue;
                }
                if (err.status === 429) throw new Error("AI free-tier limit reached. Please try again in a minute.");
                if (err.status === 400 && /api key/i.test(err.message)) {
                    throw new Error("AI is not set up: the GEMINI_API_KEY is invalid.");
                }
                if (err.status === 403) throw new Error("AI key has no access to this model. Check the Gemini API key.");
            }
            if (err instanceof SyntaxError || err instanceof z.ZodError) {
                throw new Error("The AI response was not in the expected format. Please try again.");
            }
            throw err;
        }
    }
}
