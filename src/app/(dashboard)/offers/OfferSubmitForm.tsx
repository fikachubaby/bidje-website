"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, Upload } from "lucide-react";
import { translate as t } from "@/lib/i18n/getTranslation";
import type { OfferHistoryItem } from "@/types/offer";

interface OfferSubmitFormProps {
    userId: string;
    offerHistory: OfferHistoryItem[];
    /** Pre-selected offer id, e.g. set by clicking "Select Offer" on a featured listing. */
    selectedOfferId: string;
    onSelectedOfferIdChange: (id: string) => void;
    onSubmit: (params: { offerId: string; userId: string; icFile: File; paymentProofFile: File | null }) => Promise<{ success: true } | { success: false; message: string }>;
}

/** Upload form for IC + payment proof against an existing offer. */
export function OfferSubmitForm({
    userId,
    offerHistory,
    selectedOfferId,
    onSelectedOfferIdChange,
    onSubmit,
}: OfferSubmitFormProps) {
    const [icFile, setIcFile] = useState<File | null>(null);
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setMessage(null);

        if (!selectedOfferId || !icFile) {
            setMessage({ type: "error", text: "Please select your offer item and upload your IC document." });
            return;
        }
        if (!userId) {
            setMessage({ type: "error", text: "You must be signed in to submit documents." });
            return;
        }

        setSubmitting(true);
        const result = await onSubmit({ offerId: selectedOfferId, userId, icFile, paymentProofFile });
        setSubmitting(false);

        if (result.success) {
            setMessage({ type: "success", text: "Verification documents uploaded and submitted successfully!" });
            onSelectedOfferIdChange("");
            setIcFile(null);
            setPaymentProofFile(null);
        } else {
            setMessage({ type: "error", text: `Failed to upload documents: ${result.message}` });
        }
    }

    return (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                    <Upload className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-black">{t("SubmitOfferModal.title1")}</h2>
                    <p className="text-xs text-neutral-500">{t("SubmitOfferModal.message1")}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {message && (
                    <div className={`flex items-center gap-2 rounded-2xl p-4 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                        {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                            Select Your Property Offer <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={selectedOfferId}
                            onChange={(e) => onSelectedOfferIdChange(e.target.value)}
                            className="mt-1.5 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-black bg-white focus:border-black focus:outline-none shadow-sm"
                        >
                            <option value="">-- Choose from your active property offers --</option>
                            {offerHistory.map((offer) => (
                                <option key={offer.id} value={offer.id}>
                                    {offer.propertyTitle} — {offer.offeredAmount} (Status: {offer.status})
                                </option>
                            ))}
                        </select>
                        {offerHistory.length === 0 && (
                            <p className="mt-1 text-xs text-amber-600">{t("SubmitOfferModal.message2")}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                            {t("SubmitOfferModal.message2")} <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1.5 rounded-2xl border border-dashed border-neutral-300 p-4 text-center hover:bg-neutral-50 transition-colors">
                            <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                id="ic-upload-input"
                                onChange={(e) => e.target.files && setIcFile(e.target.files[0])}
                                className="hidden"
                            />
                            <label htmlFor="ic-upload-input" className="cursor-pointer block">
                                <p className="text-xs font-semibold text-black">{icFile ? icFile.name : "Click to upload IC file"}</p>
                                <p className="text-[10px] text-neutral-400 mt-0.5">{t("Authentication.format")}</p>
                            </label>
                        </div>
                        {icFile && <p className="mt-1 text-xs font-medium text-emerald-600">✓ IC Attached</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                            Upload Payment Proof <span className="text-neutral-400 font-normal">(Optional)</span>
                        </label>
                        <div className="mt-1.5 rounded-2xl border border-dashed border-neutral-300 p-4 text-center hover:bg-neutral-50 transition-colors">
                            <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                id="proof-upload-input"
                                onChange={(e) => e.target.files && setPaymentProofFile(e.target.files[0])}
                                className="hidden"
                            />
                            <label htmlFor="proof-upload-input" className="cursor-pointer block">
                                <p className="text-xs font-semibold text-black">{paymentProofFile ? paymentProofFile.name : "Click to upload receipt"}</p>
                                <p className="text-[10px] text-neutral-400 mt-0.5">{t("Authentication.format")}</p>
                            </label>
                        </div>
                        {paymentProofFile && <p className="mt-1 text-xs font-medium text-emerald-600">✓ Receipt Attached</p>}
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-sm font-bold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 shadow-sm"
                    >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Submit Offer & Required Documents
                    </button>
                </div>
            </form>
        </div>
    );
}
