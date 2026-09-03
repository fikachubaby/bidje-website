import { useState } from "react";
import type { BuyerOffer, OfferStatus } from "@/types/offer";
import type { AdminProperty } from "@/types/property";
import { validateOfferPrice } from "@/lib/offers/validateOffer";

interface UseOffersViewParams {
    onUpdateStatus: (id: string, status: OfferStatus, remark?: string) => void;
}

export function useOffersView({ onUpdateStatus }: UseOffersViewParams) {
    const [offerErrors, setOfferErrors] = useState<Record<string, string>>({});
    const [selectedOfferForDetails, setSelectedOfferForDetails] = useState<BuyerOffer | null>(null);
    const [selectedOfferForHistory, setSelectedOfferForHistory] = useState<BuyerOffer | null>(null);
    const [rejectTarget, setRejectTarget] = useState<{ id: string; stage: "verification" | "offer" } | null>(null);

    function isPendingTooLong(createdAt: string): boolean {
        const hoursElapsed = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
        return hoursElapsed > 48;
    }

    function handleApproveVerification(offerId: string) {
        onUpdateStatus(offerId, "Verified");
    }

    function handleAcceptOffer(offer: BuyerOffer, property: AdminProperty | undefined) {
        if (property) {
            const result = validateOfferPrice({
                offerPrice: offer.amount,
                minimumPrice: property.minimumPrice,
            });

            if (!result.valid) {
                setOfferErrors((prev) => ({ ...prev, [offer.id]: result.error! }));
                return;
            }
        }

        setOfferErrors((prev) => {
            const next = { ...prev };
            delete next[offer.id];
            return next;
        });
        onUpdateStatus(offer.id, "Accepted");
    }

    function handleConfirmReject(remark: string) {
        if (!rejectTarget) return;
        const targetStatus: OfferStatus =
            rejectTarget.stage === "verification" ? "Verification Rejected" : "Rejected";
        onUpdateStatus(rejectTarget.id, targetStatus, remark);
        setRejectTarget(null);
    }

    return {
        offerErrors,
        selectedOfferForDetails,
        setSelectedOfferForDetails,
        selectedOfferForHistory,
        setSelectedOfferForHistory,
        rejectTarget,
        setRejectTarget,
        isPendingTooLong,
        handleApproveVerification,
        handleAcceptOffer,
        handleConfirmReject,
    };
}