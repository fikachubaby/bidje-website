import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { extractStatement, SUPPORTED_DOCUMENT_TYPES, type SupportedDocumentType } from "@/lib/ai/statementExtractor";

export const DOCUMENT_BUCKET = "investor-documents";
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export function isSupportedDocument(type: string): type is SupportedDocumentType {
    return (SUPPORTED_DOCUMENT_TYPES as readonly string[]).includes(type);
}

/** Stores an upload, runs AI extraction, and leaves it pending admin review. */
export async function ingestDocument(opts: {
    investorPropertyId: string;
    propertyAddress: string;
    uploadedBy: string;
    file: File;
}) {
    const { file } = opts;
    const path = `${opts.investorPropertyId}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const { error: upErr } = await supabaseAdmin.storage
        .from(DOCUMENT_BUCKET)
        .upload(path, bytes, { contentType: file.type });
    if (upErr) throw new Error(upErr.message);

    const { data: doc, error: insErr } = await supabaseAdmin
        .from("investor_documents")
        .insert({
            investor_property_id: opts.investorPropertyId,
            uploaded_by: opts.uploadedBy,
            file_path: path,
            file_name: file.name,
            mime_type: file.type,
        })
        .select("id")
        .single();
    if (insErr) throw new Error(insErr.message);

    try {
        const result = await extractStatement({
            base64: bytes.toString("base64"),
            mimeType: file.type as SupportedDocumentType,
            propertyAddress: opts.propertyAddress,
        });
        if (result.transactions.length) {
            const { error } = await supabaseAdmin.from("investor_document_transactions").insert(
                result.transactions.map((t) => ({
                    document_id: doc.id,
                    txn_date: /^\d{4}-\d{2}-\d{2}$/.test(t.date) ? t.date : null,
                    description: t.description,
                    amount: Math.abs(t.amount),
                    category: t.category,
                    confidence: t.confidence,
                    included: t.category !== "unrelated",
                }))
            );
            if (error) throw new Error(error.message);
        }
        await supabaseAdmin
            .from("investor_documents")
            .update({ status: "pending_review", ai_summary: result.summary })
            .eq("id", doc.id);
    } catch (err) {
        await supabaseAdmin
            .from("investor_documents")
            .update({ status: "failed", error: err instanceof Error ? err.message : "Extraction failed" })
            .eq("id", doc.id);
    }
    return doc.id as string;
}
