import { useState } from "react";
import { toast } from "sonner";
import type { BuyerOffer, OfferStatus } from "@/types/offer";
import type { AdminProperty } from "@/types/property";
import type { DealTypeSuggestion } from "@/components/admin/ui/DealTypeConfirmModal";
import { validateOfferPrice } from "@/lib/offers/validateOffer";

interface UseOffersViewParams {
    onUpdateStatus: (id: string, status: OfferStatus, remark?: string) => void;
    onOfferAccepted?: (offer: BuyerOffer) => void;
}

interface DealTypeModalState {
    offerId: string;
    propertyTitle?: string;
    suggestion: DealTypeSuggestion;
}

export function useOffersView({ onUpdateStatus, onOfferAccepted }: UseOffersViewParams) {
    const [offerErrors, setOfferErrors] = useState<Record<string, string>>({});
    const [selectedOfferForDetails, setSelectedOfferForDetails] = useState<BuyerOffer | null>(null);
    const [selectedOfferForHistory, setSelectedOfferForHistory] = useState<BuyerOffer | null>(null);
    const [rejectTarget, setRejectTarget] = useState<{ id: string; stage: "verification" | "offer" } | null>(null);
    const [dealTypeModal, setDealTypeModal] = useState<DealTypeModalState | null>(null);
    const [confirmingDealType, setConfirmingDealType] = useState(false);

    function isPendingTooLong(createdAt: string): boolean {
        const hoursElapsed = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
        return hoursElapsed > 48;
    }

    function handleApproveVerification(offerId: string) {
        onUpdateStatus(offerId, "Verified");
    }

    async function handleAcceptOffer(offer: BuyerOffer, property: AdminProperty | undefined) {
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

        try {
            const res = await fetch(`/api/admin/offers/${offer.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Accepted" }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to accept offer");
            }

            toast.success("Offer accepted");
            onOfferAccepted?.(offer);

            if (data.dealTypeSuggestion) {
                setDealTypeModal({
                    offerId: offer.id,
                    propertyTitle: property?.name,
                    suggestion: data.dealTypeSuggestion,
                });
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to accept offer");
        }
    }

    async function handleConfirmDealType(dealTypeCode: string) {
        if (!dealTypeModal) return;
        setConfirmingDealType(true);

        try {
            const res = await fetch(`/api/admin/offers/${dealTypeModal.offerId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Accepted", dealTypeCode }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to set up legal case");
            }

            toast.success("Legal case created — visible in the Case Tracker");
            setDealTypeModal(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to set up legal case");
        } finally {
            setConfirmingDealType(false);
        }
    }

    function handleSkipDealType() {
        setDealTypeModal(null);
        toast.info?.("Legal case setup skipped — you can confirm it later from the offer details.");
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
        dealTypeModal,
        confirmingDealType,
        handleConfirmDealType,
        handleSkipDealType,
    };
}
