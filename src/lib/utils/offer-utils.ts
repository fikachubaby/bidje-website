import {
    OFFER_STATUSES,
    OfferStatus,
    RawOfferRow,
    AdminOfferItem,
} from "@/types/offer";

function toOfferStatus(raw: unknown): OfferStatus {
    const value = String(raw ?? "");
    return (OFFER_STATUSES as readonly string[]).includes(value) ? (value as OfferStatus) : "Submitted";
}

function extractSingle<T>(raw: unknown): T | null {
    if (!raw) return null;
    if (Array.isArray(raw)) return (raw[0] as T) ?? null;
    if (typeof raw === "object") return raw as T;
    return null;
}

export function mapAdminOfferRow(
    row: RawOfferRow,
    profile?: { full_name?: string; email?: string }
): AdminOfferItem {
    const property = extractSingle<{ title?: unknown }>(row.properties);

    return {
        id: String(row.id ?? ""),
        propertyId: String(row.property_id ?? ""),
        propertyTitle: typeof property?.title === "string" && property.title.trim() ? property.title : "Untitled Property",
        buyerName: profile?.full_name?.trim() || "Unknown Buyer",
        buyerEmail: profile?.email || "",
        offeredAmount: `RM ${Number(row.offer_price ?? 0).toLocaleString()}`,
        status: toOfferStatus(row.status),
        dateSubmitted: row.submitted_at ? String(row.submitted_at).split("T")[0] : "",
        icDocumentUrl: typeof row.ic_upload_url === "string" ? row.ic_upload_url : null,
        paymentProofUrl: typeof row.payment_proof_url === "string" ? row.payment_proof_url : null,
        verificationRemark: typeof row.verification_remark === "string" ? row.verification_remark : null,
    };
}
