import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

/** Bucket where subscribers upload offer IC / payment proof files. */
export const OFFER_DOCUMENTS_BUCKET = "property-documents";

/**
 * Offers store a storage path (e.g. "offers/<user>/ic-123.png"), not a URL.
 * Turn it into a short-lived signed link staff can open; full URLs pass through unchanged.
 */
export async function signOfferDocument(value: string | null | undefined, expiresIn = 3600) {
    if (!value) return undefined;
    if (/^https?:\/\//.test(value)) return value;

    const { data, error } = await supabaseAdmin.storage
        .from(OFFER_DOCUMENTS_BUCKET)
        .createSignedUrl(value.replace(/^\/+/, ""), expiresIn);
    if (error) {
        console.error("Could not sign offer document", value, error.message);
        return undefined;
    }
    return data.signedUrl;
}
