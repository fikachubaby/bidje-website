import { PendingOfferDraft, FormData, FormErrors } from "@/lib/offers/pendingOffer";

export interface SubmitOfferModalProps {
    open: boolean;
    onClose: () => void;
    propertyId: string;
    propertyTitle: string;
    minimumPrice?: number;
    prefill?: PendingOfferDraft | null;
    autoSubmit?: boolean;
}

export type { FormData, FormErrors };