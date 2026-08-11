const STORAGE_KEY = "bidje:pendingOffer";

export interface FormData {
    fullName: string;
    phone: string;
    email: string;
    deposit: string;
    offerAmount: string;
    purchaseMethod: string;
    financingConsultantId: string;
    legalFirmId: string;
    message: string;
    confirmed: boolean;
}

export interface FormErrors {
    fullName?: string;
    phone?: string;
    email?: string;
    deposit?: string;
    offerAmount?: string;
    purchaseMethod?: string;
    financingConsultantId?: string;
    legalFirmId?: string;
    confirmed?: string;
}

export interface PendingOfferDraft extends FormData {
    propertyId: string;
}

export function savePendingOffer(draft: PendingOfferDraft) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function loadPendingOffer(propertyId: string): PendingOfferDraft | null {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as PendingOfferDraft;
        if (parsed.propertyId !== propertyId) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function clearPendingOffer() {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(STORAGE_KEY);
}