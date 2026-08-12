"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react";

interface OfferDocumentsProps {
    offerId: string;
    icUrl?: string | null;
    paymentProofUrl?: string | null;
    invoiceUrl?: string | null;
    onUpdate: () => void;
}

export function OfferDocumentsColumn({
    offerId,
    icUrl,
    paymentProofUrl,
    invoiceUrl,
    onUpdate,
}: OfferDocumentsProps) {
    const [uploadingType, setUploadingType] = useState<"ic" | "proof" | null>(null);
    const [secureIcUrl, setSecureIcUrl] = useState<string | null>(null);
    const [secureProofUrl, setSecureProofUrl] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSignedUrls() {
            if (icicPathClean(icUrl)) {
                const { data } = await supabase.storage
                    .from("property-documents")
                    .createSignedUrl(icicPathClean(icUrl)!, 3600);
                if (data) setSecureIcUrl(data.signedUrl);
            }

            if (icicPathClean(paymentProofUrl)) {
                const { data } = await supabase.storage
                    .from("property-documents")
                    .createSignedUrl(icicPathClean(paymentProofUrl)!, 3600);
                if (data) setSecureProofUrl(data.signedUrl);
            }
        }
        void fetchSignedUrls();
    }, [icUrl, paymentProofUrl]);

    function icicPathClean(pathOrUrl: string | null | undefined) {
        if (!pathOrUrl) return null;
        if (pathOrUrl.startsWith("http")) {
            // Extract path if legacy full URL was saved
            const parts = pathOrUrl.split("/property-documents/");
            return parts[1] || pathOrUrl;
        }
        return pathOrUrl;
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, type: "ic" | "proof") {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingType(type);
        const filePath = `offers/${offerId}/${type}-${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
            .from("property-documents")
            .upload(filePath, file);

        if (!uploadError) {
            const updatePayload =
                type === "ic"
                    ? { ic_upload_url: filePath }
                    : { payment_proof_url: filePath };

            await supabase.from("offers").update(updatePayload).eq("id", offerId);
            onUpdate();
        } else {
            console.error("Upload error:", uploadError.message);
        }
        setUploadingType(null);
    }

    const hasIc = Boolean(icUrl);
    const hasProof = Boolean(paymentProofUrl);
    const isComplete = hasIc;

    return (
        <div className="space-y-2 text-xs">
            {/* Status Badge */}
            <div className="flex items-center gap-1.5 font-semibold">
                {isComplete ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" /> Complete
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-amber-600">
                        <AlertCircle className="h-4 w-4" /> Pending IC Upload
                    </span>
                )}
            </div>

            {/* IC Document (Required) */}
            <div className="flex items-center justify-between gap-2 rounded bg-neutral-50 p-2">
                <span className="font-medium text-neutral-700">IC (Required):</span>
                {hasIc && secureIcUrl ? (
                    <a href={secureIcUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">
                        View IC
                    </a>
                ) : hasIc ? (
                    <span className="text-neutral-400">Loading...</span>
                ) : (
                    <label className="cursor-pointer text-blue-600 hover:underline flex items-center gap-1 font-medium">
                        <Upload className="h-3 w-3" /> {uploadingType === "ic" ? "Uploading..." : "Upload IC"}
                        <input type="file" className="hidden" onChange={(e) => handleUpload(e, "ic")} accept="image/*,.pdf" />
                    </label>
                )}
            </div>

            {/* Proof of Payment (Optional) */}
            <div className="flex items-center justify-between gap-2 rounded bg-neutral-50 p-2">
                <span className="font-medium text-neutral-700">Payment Receipt:</span>
                {hasProof && secureProofUrl ? (
                    <a href={secureProofUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">
                        View Receipt
                    </a>
                ) : hasProof ? (
                    <span className="text-neutral-400">Loading...</span>
                ) : (
                    <label className="cursor-pointer text-blue-600 hover:underline flex items-center gap-1 font-medium">
                        <Upload className="h-3 w-3" /> {uploadingType === "proof" ? "Uploading..." : "Upload"}
                        <input type="file" className="hidden" onChange={(e) => handleUpload(e, "proof")} accept="image/*,.pdf" />
                    </label>
                )}
            </div>

            {/* Auto-Generated Invoice */}
            {invoiceUrl && (
                <div className="flex items-center justify-between gap-2 rounded bg-emerald-50 p-2 border border-emerald-100">
                    <span className="font-medium text-emerald-800 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Invoice:
                    </span>
                    <a href={invoiceUrl} target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold">
                        Download PDF
                    </a>
                </div>
            )}
        </div>
    );
}