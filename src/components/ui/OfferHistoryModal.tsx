"use client";

import { XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/ButtonProps";
import type { BuyerOffer } from "@/types/offer";

interface OfferHistoryModalProps {
    offer: BuyerOffer | null;
    onClose: () => void;
}

const TERMINAL_STATUSES = ["Accepted", "Rejected", "Verification Rejected"];

function statusDotColor(status: string) {
    if (status === "Accepted" || status === "Verified") return "bg-emerald-600";
    if (status === "Rejected" || status === "Verification Rejected") return "bg-red-600";
    return "bg-amber-500";
}

function statusDescription(status: string) {
    switch (status) {
        case "Submitted":
        case "Pending Documents":
            return "Awaiting IC and payment proof upload.";
        case "Under Verification":
            return "Documents received — awaiting admin review.";
        case "Verification Rejected":
            return "Documents were rejected. See remark below for what to fix.";
        case "Verified":
            return "Documents verified. Awaiting final offer decision.";
        case "Accepted":
            return "Offer was accepted.";
        case "Rejected":
            return "Offer was declined.";
        default:
            return `Offer was marked as ${status}.`;
    }
}

export function OfferHistoryModal({ offer, onClose }: OfferHistoryModalProps) {
    if (!offer) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                    <h3 className="text-lg font-bold text-neutral-900">Offer Timeline & History</h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                    >
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>

                <div className="mt-6 space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-neutral-200">
                    <div className="relative flex items-start gap-4">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold ring-4 ring-white">
                            1
                        </span>
                        <div>
                            <p className="text-sm font-bold text-neutral-900">Offer Submitted</p>
                            <p className="text-xs text-neutral-400">
                                {new Date(offer.createdAt).toLocaleString()}
                            </p>
                            <p className="text-xs text-neutral-600 mt-1">Buyer submitted an offer of {formatPrice(offer.amount)}.</p>
                        </div>
                    </div>

                    <div className="relative flex items-start gap-4">
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold ring-4 ring-white ${statusDotColor(offer.status)}`}>
                            2
                        </span>
                        <div>
                            <p className="text-sm font-bold text-neutral-900">Current Status: {offer.status}</p>
                            <p className="text-xs text-neutral-400">
                                {TERMINAL_STATUSES.includes(offer.status) ? "Final state" : "In progress"}
                            </p>
                            <p className="text-xs text-neutral-600 mt-1">
                                {statusDescription(offer.status)}
                            </p>
                            {offer.status === "Verification Rejected" && offer.verificationRemark && (
                                <p className="mt-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                                    <strong>Admin remark:</strong> {offer.verificationRemark}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}