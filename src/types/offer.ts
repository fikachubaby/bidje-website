import { PendingOfferDraft, FormData, FormErrors } from "@/lib/offers/pendingOffer";
import type { PropertyListing } from "@/types/property";

export const OFFER_STATUSES = [
    "Submitted",
    "Pending Documents",
    "Under Verification",
    "Verification Rejected",
    "Verified",
    "Accepted",
    "Rejected",
] as const;

export type { FormData, FormErrors };

export type OfferStatus = (typeof OFFER_STATUSES)[number];
export interface SubmitOfferModalProps {
    open: boolean;
    onClose: () => void;
    propertyId: string;
    propertyTitle: string;
    minimumPrice?: number;
    prefill?: PendingOfferDraft | null;
    autoSubmit?: boolean;
}

export interface BuyerOffer {
    id: string;
    propertyId: string;
    buyerName: string;
    buyerPhone: string;
    buyerEmail: string;
    amount: number;
    message: string;
    status: OfferStatus;
    createdAt: string;
    icDocumentUrl?: string;
    paymentProofUrl?: string;
    invoiceUrl?: string | null;
    verificationRemark?: string | null;
    history?: OfferHistoryItem[];
}

export interface OfferHistoryItem {
    id: string;
    propertyId: string;
    action?: string;
    timestamp?: string;
    performedBy?: string;
    propertyTitle: string;
    offeredAmount: string;
    status: string;
    dateSubmitted: string;
    icDocumentUrl?: string | null;
    paymentProofUrl?: string | null;
    invoiceUrl?: string | null;
    propertyData: PropertyListing | null;
    verificationRemark: string | null;
}

export interface SupabaseOfferRecord {
    id: string;
    property_id?: string | null;
    offer_price?: number | null;
    status?: OfferStatus | null;
    submitted_at?: string | null;
    ic_upload_url?: string | null;
    payment_proof_url?: string | null;
    invoice_url?: string | null;
}

/** Raw shape of a row from `select(...)` on `offers`, joined with `properties`. */
export interface RawOfferRow {
    id?: unknown;
    property_id?: unknown;
    user_id?: unknown;
    offer_price?: unknown;
    status?: unknown;
    submitted_at?: unknown;
    ic_upload_url?: unknown;
    payment_proof_url?: unknown;
    verification_remark?: unknown;
    verified_at?: unknown;
    properties?: unknown;
    profiles?: unknown; // joined buyer profile (full_name, email)
}

export interface AdminOfferItem {
    id: string;
    propertyId: string;
    propertyTitle: string;
    buyerName: string;
    buyerEmail: string;
    offeredAmount: string;
    status: OfferStatus;
    dateSubmitted: string;
    icDocumentUrl: string | null;
    paymentProofUrl: string | null;
    verificationRemark: string | null;
}