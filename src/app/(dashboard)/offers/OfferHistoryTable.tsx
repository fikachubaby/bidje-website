"use client";

import { Eye, History } from "lucide-react";
import { translate as t } from "@/lib/i18n/getTranslation";
import type { OfferHistoryItem } from "@/types/offer";

interface OfferHistoryTableProps {
    offerHistory: OfferHistoryItem[];
    loading: boolean;
    onViewDetails: (offer: OfferHistoryItem) => void;
}

function statusBadgeStyles(status: string): string {
    if (status === "Accepted") return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (status === "Rejected") return "bg-red-50 text-red-800 border-red-200";
    return "bg-amber-50 text-amber-800 border-amber-200";
}

/** Offer History Log table: property title (never a raw UUID) + a "View Details" popup trigger. */
export function OfferHistoryTable({ offerHistory, loading, onViewDetails }: OfferHistoryTableProps) {
    return (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                        <History className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-black">{t("Subscribers.title5")}</h2>
                        <p className="text-xs text-neutral-500">{t("Subscribers.title5")}</p>
                    </div>
                </div>
                <span className="text-xs font-semibold bg-neutral-100 px-3 py-1 rounded-full text-neutral-600">
                    {offerHistory.length} {t("SubmitOfferModal.totalOffer")}
                </span>
            </div>

            <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-neutral-100 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                            <th className="pb-3 px-3">Property</th>
                            <th className="pb-3 px-3">{t("SubmitOfferModal.fields.offerAmount.title")}</th>
                            <th className="pb-3 px-3">Date Submitted</th>
                            <th className="pb-3 px-3">Documents / Status</th>
                            <th className="pb-3 px-3">Status</th>
                            <th className="pb-3 px-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-sm text-neutral-500">
                                    Loading offer history…
                                </td>
                            </tr>
                        ) : offerHistory.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-sm text-neutral-500">
                                    {t("SubmitOfferModal.noOffer")}
                                </td>
                            </tr>
                        ) : (
                            offerHistory.map((offer) => (
                                <tr key={offer.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="py-4 px-3 font-semibold text-black align-top">
                                        {offer.propertyTitle}
                                    </td>
                                    <td className="py-4 px-3 text-neutral-800 align-top">{offer.offeredAmount}</td>
                                    <td className="py-4 px-3 text-neutral-500 align-top">{offer.dateSubmitted}</td>
                                    <td className="py-4 px-3 align-top text-xs text-neutral-600">
                                        <div className="space-y-1">
                                            <p className="font-medium text-black">
                                                {offer.icDocumentUrl ? "✓ IC Submitted" : "⚠️ Missing IC"}
                                            </p>
                                            <p className="text-neutral-500">
                                                {offer.paymentProofUrl ? "✓ Payment Proof Attached" : "No Proof Attached"}
                                            </p>
                                            {offer.invoiceUrl && (
                                                <a href={offer.invoiceUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline block mt-1">
                                                    View Invoice
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4 px-3 align-top">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${statusBadgeStyles(offer.status)}`}>
                                            {offer.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-3 align-top text-right">
                                        <button
                                            onClick={() => onViewDetails(offer)}
                                            disabled={!offer.propertyData}
                                            className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-sm transition-all hover:bg-black hover:text-white hover:border-black disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Eye className="h-3.5 w-3.5" />
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
