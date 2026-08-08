import { PendingOfferDraft } from "@/lib/offers/pendingOffer";

export interface SubmitOfferModalProps {
    open: boolean;
    onClose: () => void;
    propertyId: string;
    propertyTitle: string;
    minimumPrice?: number;
    prefill?: PendingOfferDraft | null;
    autoSubmit?: boolean;
}

export interface FormData {
    fullName: string;
    phone: string;
    email: string;
    offerAmount: string;
    purchaseMethod: string;
    message: string;
    confirmed: boolean;
}

export interface FormErrors {
    fullName?: string;
    phone?: string;
    email?: string;
    offerAmount?: string;
    purchaseMethod?: string;
    confirmed?: string;
}