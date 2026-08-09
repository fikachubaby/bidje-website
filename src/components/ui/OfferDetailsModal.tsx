"use client";

import { FileText, ExternalLink, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/ButtonProps";
import type { BuyerOffer } from "@/types/property";

interface OfferDetailsModalProps {
    offer: BuyerOffer | null;
    onClose: () => void;
    onViewDocument: (title: string, url: string) => void;
}

export function OfferDetailsModal({ offer, onClose, onViewDocument }: OfferDetailsModalProps) {
    if (!offer) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                    <h3 className="text-lg font-bold text-neutral-900">Offer Details — {offer.id}</h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                    >
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>

                <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 rounded-xl bg-neutral-50 p-4">
                        <div>
                            <p className="text-xs font-bold text-neutral-400 uppercase">Buyer Name</p>
                            <p className="font-semibold text-neutral-800">{offer.buyerName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-neutral-400 uppercase">Offer Amount</p>
                            <p className="font-bold text-emerald-600">{formatPrice(offer.amount)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-neutral-400 uppercase">Phone Number</p>
                            <p className="font-medium text-neutral-800">{offer.buyerPhone}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-neutral-400 uppercase">Email Address</p>
                            <p className="font-medium text-neutral-800">{offer.buyerEmail || "N/A"}</p>
                        </div>
                    </div>

                    {offer.message && (
                        <div>
                            <p className="text-xs font-bold text-neutral-400 uppercase mb-1">Buyer Message / Notes</p>
                            <p className="rounded-xl bg-neutral-50 p-3 text-sm text-neutral-600">{offer.message}</p>
                        </div>
                    )}

                    <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase mb-2">Uploaded Verification Documents</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm font-medium text-neutral-700">IC / Passport Copy</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onViewDocument("IC Document", offer.icDocumentUrl || "#")}
                                    className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                    View <ExternalLink className="h-3 w-3" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-3">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-emerald-600" />
                                    <span className="text-sm font-medium text-neutral-700">Payment Proof</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onViewDocument("Payment Proof", offer.paymentProofUrl || "#")}
                                    className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                                >
                                    View <ExternalLink className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
}