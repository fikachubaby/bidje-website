import { parseOfferAmount } from "@/lib/offers/validateOffer";
import { postToGateway } from "@/lib/payments/postToGateway";
import type { FormData } from "@/lib/offers/pendingOffer";

export interface SubmitOfferParams {
    propertyId: string;
    data: FormData;
}

export interface SubmitOfferResult {
    success: boolean;
    error?: string;
}

/**
 * Creates the offer on the server and sends the browser to Fiuu for the RM500 commitment fee.
 * On success the page navigates away; the signed Fiuu callback marks the offer as paid.
 */
export async function submitOfferWithPayment({ propertyId, data }: SubmitOfferParams): Promise<SubmitOfferResult> {
    try {
        const res = await fetch("/api/payments/fiuu/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                propertyId,
                offerPrice: parseOfferAmount(data.offerAmount),
                deposit: data.deposit ? parseOfferAmount(data.deposit) : null,
                purchaseMethod: data.purchaseMethod,
                financingConsultantId: data.financingConsultantId || null,
                legalFirmId: data.legalFirmId || null,
                contactPhone: data.phone,
            }),
        });
        const json = await res.json();
        if (!res.ok) return { success: false, error: json.error || "Failed to submit offer. Please try again." };

        postToGateway(json.checkout.actionUrl, json.checkout.fields);
        return { success: true };
    } catch {
        return { success: false, error: "Failed to submit offer. Please try again." };
    }
}
