"use client";

import { useState } from "react";
import { History, FileText, ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface OfferHistoryItem {
    id: string;
    propertyTitle: string;
    offeredAmount: string;
    status: "Pending" | "Accepted" | "Rejected";
    dateSubmitted: string;
    icFileName?: string;
    paymentProofName?: string;
}

export default function OffersPage() {
    const [offerHistory] = useState<OfferHistoryItem[]>([
        {
            id: "off-101",
            propertyTitle: "TRX Residences Luxury Service Suite",
            offeredAmount: "RM 3,100 /mo",
            status: "Pending",
            dateSubmitted: "2026-03-08",
            icFileName: "ic_copy_ahmad.pdf",
            paymentProofName: "rm500_fee_trx.pdf"
        },
        {
            id: "off-102",
            propertyTitle: "Modern Freehold Link Terrace",
            offeredAmount: "RM 750,000",
            status: "Accepted",
            dateSubmitted: "2026-02-14",
            icFileName: "ic_front_back.png",
            paymentProofName: "receipt_setia_alam.pdf"
        }
    ]);

    return (
        <div className="mx-auto max-w-5xl space-y-8 pb-12">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-neutral-500">
                <Link href="/dashboard" className="flex items-center gap-1.5 transition-colors hover:text-black">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                </Link>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
                <span className="font-medium text-black">Offers History</span>
            </nav>

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-black">Property Offer History</h1>
                <p className="mt-1 text-sm text-neutral-500">Review all purchase and rental offers submitted along with verification statuses.</p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                            <History className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-black">All Submitted Bids</h2>
                    </div>
                    <span className="text-xs font-semibold bg-neutral-100 px-3 py-1 rounded-full text-neutral-600">
                        {offerHistory.length} Total Offers
                    </span>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                <th className="pb-3 px-3">Property</th>
                                <th className="pb-3 px-3">Offer Amount</th>
                                <th className="pb-3 px-3">Date Submitted</th>
                                <th className="pb-3 px-3">Uploaded Documents</th>
                                <th className="pb-3 px-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-sm">
                            {offerHistory.map((offer) => {
                                let badgeStyles = "bg-amber-50 text-amber-800 border-amber-200";
                                if (offer.status === "Accepted") badgeStyles = "bg-emerald-50 text-emerald-800 border-emerald-200";
                                if (offer.status === "Rejected") badgeStyles = "bg-red-50 text-red-800 border-red-200";

                                return (
                                    <tr key={offer.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 px-3 font-semibold text-black">{offer.propertyTitle}</td>
                                        <td className="py-4 px-3 text-neutral-800">{offer.offeredAmount}</td>
                                        <td className="py-4 px-3 text-neutral-500">{offer.dateSubmitted}</td>
                                        <td className="py-4 px-3">
                                            <div className="flex flex-col gap-0.5 text-xs text-neutral-600">
                                                <span className="flex items-center gap-1"><FileText className="h-3 w-3 text-neutral-400" /> IC: {offer.icFileName}</span>
                                                <span className="flex items-center gap-1"><FileText className="h-3 w-3 text-neutral-400" /> Fee Proof: {offer.paymentProofName}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-3">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${badgeStyles}`}>
                                                {offer.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}