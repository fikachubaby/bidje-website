import type { PropertyListing } from "@/types/property";
import { mapPropertyRowToListing } from "../properties/utils";
import type { RawPropertyRow } from "../properties/types";
import type { OfferHistoryItem, RawOfferRow } from "@/types/offer";

/**
 * The `properties` relation on a joined offers query can come back as a
 * single object or a one-item array depending on the FK direction Supabase
 * infers. Normalize to a single row (or null) here.
 */
function extractJoinedPropertyRow(raw: unknown): RawPropertyRow | null {
    if (!raw) return null;
    if (Array.isArray(raw)) return (raw[0] as RawPropertyRow) ?? null;
    if (typeof raw === "object") return raw as RawPropertyRow;
    return null;
}

/**
 * Maps a raw `offers` row (with a joined `properties` relation) into the
 * shape the offer history table and submit form use. Always resolves a
 * human-readable `propertyTitle` — never a bare UUID.
 */
export function mapOfferRowToHistoryItem(row: RawOfferRow, isMember: boolean): OfferHistoryItem {
    const propertyId = String(row.property_id ?? "").trim();
    const joinedRow = extractJoinedPropertyRow(row.properties);

    let propertyData: PropertyListing | null = null;
    if (joinedRow) {
        propertyData = mapPropertyRowToListing(joinedRow, isMember);
    }

    const propertyTitle = propertyData?.title
        ?? (propertyId ? `Property listing (${propertyId.slice(0, 8)}…)` : "Unassigned Property");

    return {
        id: String(row.id ?? ""),
        propertyId,
        propertyTitle,
        offeredAmount: `RM ${Number(row.offer_price ?? 0).toLocaleString()}`,
        status: String(row.status ?? "Pending"),
        dateSubmitted: row.submitted_at ? String(row.submitted_at).split("T")[0] : "",
        icDocumentUrl: typeof row.ic_upload_url === "string" ? row.ic_upload_url : null,
        paymentProofUrl: typeof row.payment_proof_url === "string" ? row.payment_proof_url : null,
        invoiceUrl: null, // filled in by the hook once invoices are fetched
        propertyData,
    };
}
