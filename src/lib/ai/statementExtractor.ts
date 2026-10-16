import { z } from "zod";
import { generateStructured, type AiDocumentType } from "@/lib/ai";

export const SUPPORTED_DOCUMENT_TYPES: readonly AiDocumentType[] = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
export type SupportedDocumentType = AiDocumentType;

const ExtractionSchema = z.object({
    summary: z.string().describe("One sentence: what the document is and the period it covers."),
    transactions: z.array(
        z.object({
            date: z.string().describe("YYYY-MM-DD, or empty string if unreadable"),
            description: z.string(),
            amount: z.number().describe("Positive ringgit amount paid out (debit)."),
            category: z.enum(["purchase", "legal", "renovation", "other", "unrelated"]),
            confidence: z.number().describe("0 to 1"),
        })
    ),
});

export type StatementExtraction = z.infer<typeof ExtractionSchema>;

const SYSTEM = `You read Malaysian bank statements, receipts and invoices uploaded by property investors.
Extract only money paid OUT (debits) that could relate to the given property.
Categorise each line:
- purchase: deposit or balance paid to buy the property (auction, SPA, vendor, developer)
- legal: lawyers, stamp duty, court, Land Office, valuation, search fees
- renovation: contractors, building materials, hardware stores, plumbers, electricians, cleaning
- other: utilities, quit rent, assessment, insurance, agent fees for this property
- unrelated: anything that is clearly personal or not about property
Never invent lines that are not in the document. Use confidence below 0.6 when the purpose is a guess.`;

export async function extractStatement(opts: {
    base64: string;
    mimeType: SupportedDocumentType;
    propertyAddress: string;
}): Promise<StatementExtraction> {
    return generateStructured({
        system: SYSTEM,
        text: `Property this upload is for: ${opts.propertyAddress}`,
        file: { base64: opts.base64, mimeType: opts.mimeType },
        schema: ExtractionSchema,
        effort: "medium",
    });
}
