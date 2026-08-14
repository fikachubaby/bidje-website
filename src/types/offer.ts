import { PendingOfferDraft, FormData, FormErrors } from "@/lib/offers/pendingOffer";

export type { FormData, FormErrors };
export type OfferStatus = "Pending" | "Accepted" | "Rejected";
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
    history?: OfferHistoryItem[];
}

export interface OfferHistoryItem {
    id: string;
    action?: string;
    timestamp?: string;
    performedBy?: string;
    propertyTitle: string;
    offeredAmount: string;
    status: "Pending" | "Accepted" | "Rejected";
    dateSubmitted: string;
    icDocumentUrl?: string | null;
    paymentProofUrl?: string | null;
    invoiceUrl?: string | null;
}

export interface SupabaseOfferRecord {
    id: string;
    property_id?: string | null;
    offer_price?: number | null;
    status?: "Pending" | "Accepted" | "Rejected" | null;
    submitted_at?: string | null;
    ic_upload_url?: string | null;
    payment_proof_url?: string | null;
    invoice_url?: string | null;
}