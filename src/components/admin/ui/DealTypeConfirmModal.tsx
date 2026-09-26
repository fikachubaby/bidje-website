"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { FormSelect } from "@/components/admin/ui/FormField";

export interface DealTypeSuggestion {
    deal_type_code: string;
    needs_leasehold_consent: boolean;
    needs_bumi_consent: boolean;
    confidence: "high" | "low";
}

const DEAL_TYPE_OPTIONS = [
    { code: "standard_cash", label: "Standard Sub-Sale — Cash" },
    { code: "standard_loan", label: "Standard Sub-Sale — Loan Financed" },
    { code: "developer_hda", label: "Developer Primary Market (HDA Schedule G/H)" },
    { code: "no_individual_title", label: "Property Without Individual Title (Deed of Assignment)" },
    { code: "auction", label: "Auction Property (Proclamation of Sale)" },
];

interface DealTypeConfirmModalProps {
    propertyTitle?: string;
    suggestion: DealTypeSuggestion;
    onConfirm: (dealTypeCode: string) => void;
    onSkip: () => void;
    submitting?: boolean;
}

export function DealTypeConfirmModal({
    propertyTitle,
    suggestion,
    onConfirm,
    onSkip,
    submitting = false,
}: DealTypeConfirmModalProps) {
    const [dealTypeCode, setDealTypeCode] = useState(suggestion.deal_type_code);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-lg font-bold text-neutral-900">Set up legal case tracking</h3>
                <p className="mt-1 text-sm text-neutral-500">
                    {propertyTitle ?? "This property"} — offer accepted. Confirm the legal path to start tracking stages.
                </p>

                {suggestion.confidence === "low" && (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <p className="text-xs font-medium text-amber-800">
                            Property&apos;s tenure or Bumi status is missing or unclear — please confirm the deal type manually before proceeding.
                        </p>
                    </div>
                )}

                {(suggestion.needs_leasehold_consent || suggestion.needs_bumi_consent) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {suggestion.needs_leasehold_consent && (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                                + State Authority Consent required
                            </span>
                        )}
                        {suggestion.needs_bumi_consent && (
                            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
                                + Bumi Transfer Consent required
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-4">
                    <FormSelect
                        label="Legal deal type"
                        value={dealTypeCode}
                        onChange={(e) => setDealTypeCode(e.target.value)}
                    >
                        {DEAL_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.code} value={opt.code}>
                                {opt.label}
                            </option>
                        ))}
                    </FormSelect>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="secondary" onClick={onSkip} disabled={submitting}>
                        Set up later
                    </Button>
                    <Button onClick={() => onConfirm(dealTypeCode)} disabled={submitting}>
                        {submitting ? "Creating case..." : "Confirm & Create Legal Case"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
