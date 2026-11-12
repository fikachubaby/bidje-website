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

/* ---- Documents Bidje shares with the investor (no AI extraction / review) ---- */

const SHARED_TABLE = "investor_shared_documents";

export interface SharedDocument {
    id: string;
    fileName: string;
    createdAt: string;
    url: string | null;
}

/** Shared documents for a property, each with a 10-minute download link. */
export async function listSharedDocuments(investorPropertyId: string): Promise<SharedDocument[]> {
    const { data, error } = await supabaseAdmin
        .from(SHARED_TABLE)
        .select("id, file_path, file_name, created_at")
        .eq("investor_property_id", investorPropertyId)
        .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    if (!data?.length) return [];

    const { data: signed } = await supabaseAdmin.storage.from(DOCUMENT_BUCKET).createSignedUrls(
        data.map((d) => d.file_path),
        600
    );
    return data.map((d, i) => ({
        id: d.id,
        fileName: d.file_name,
        createdAt: d.created_at,
        url: signed?.[i]?.signedUrl ?? null,
    }));
}

export async function storeSharedDocument(opts: { investorPropertyId: string; uploadedBy: string; file: File }) {
    const { file } = opts;
    const path = `${opts.investorPropertyId}/shared/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error: upErr } = await supabaseAdmin.storage
        .from(DOCUMENT_BUCKET)
        .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
    if (upErr) throw new Error(upErr.message);

    const { error } = await supabaseAdmin.from(SHARED_TABLE).insert({
        investor_property_id: opts.investorPropertyId,
        uploaded_by: opts.uploadedBy,
        file_path: path,
        file_name: file.name,
        mime_type: file.type,
    });
    if (error) {
        // Don't leave an orphan file behind.
        await supabaseAdmin.storage.from(DOCUMENT_BUCKET).remove([path]);
        throw new Error(error.message);
    }
}

export async function deleteSharedDocument(investorPropertyId: string, docId: string) {
    const { data, error } = await supabaseAdmin
        .from(SHARED_TABLE)
        .delete()
        .eq("id", docId)
        .eq("investor_property_id", investorPropertyId)
        .select("file_path")
        .maybeSingle();
    if (error) throw new Error(error.message);
    if (data) await supabaseAdmin.storage.from(DOCUMENT_BUCKET).remove([data.file_path]);
}
