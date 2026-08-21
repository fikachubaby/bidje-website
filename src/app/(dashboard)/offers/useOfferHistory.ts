"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { mapOfferRowToHistoryItem } from "./utils";
import type { OfferHistoryItem, RawOfferRow } from "@/types/offer";

interface UseOfferHistoryResult {
    offerHistory: OfferHistoryItem[];
    loading: boolean;

    submitOfferDocuments: (params: {
        offerId: string;
        userId: string;
        icFile: File;
        paymentProofFile: File | null;
    }) => Promise<{ success: true } | { success: false; message: string }>;
}

const OFFERS_SELECT = `
    id,
    property_id,
    offer_price,
    status,
    submitted_at,
    ic_upload_url,
    payment_proof_url,
    properties!offers_property_id_fkey (
        id, title, district, state, asking_price, property_type, bedrooms, bathrooms, area_sqft,
        property_images ( id, image_url, is_cover, display_order )
    )
`;

/** Turns any thrown value into a plain, always-loggable object (handles PostgrestError, Error, and bare objects). */
function describeError(err: unknown): Record<string, unknown> {
    if (err && typeof err === "object") {
        const asRecord = err as Record<string, unknown>;
        const known = {
            message: asRecord.message,
            details: asRecord.details,
            hint: asRecord.hint,
            code: asRecord.code,
            status: asRecord.status,
            statusText: asRecord.statusText,
        };
        const hasKnownInfo = Object.values(known).some((v) => v !== undefined);
        if (hasKnownInfo) return known;

        try {
            return JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)));
        } catch {
            return { stringified: String(err) };
        }
    }
    return { value: err };
}

/**
 * Fetches the signed-in user's offer history (with property titles resolved
 * via join) and their invoices, and exposes a mutation for uploading offer
 * verification documents.
 */
export function useOfferHistory(userId: string, isMember: boolean): UseOfferHistoryResult {
    const [offerHistory, setOfferHistory] = useState<OfferHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            if (!userId) {
                setOfferHistory([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const [offersResponse, invoicesResponse] = await Promise.all([
                    supabase
                        .from("offers")
                        .select(OFFERS_SELECT)
                        .eq("user_id", userId)
                        .order("submitted_at", { ascending: false }),
                    supabase
                        .from("offer_invoices")
                        .select("offer_id, invoice_url")
                        .eq("user_id", userId),
                ]);

                if (offersResponse.error) throw offersResponse.error;

                const invoiceMap = new Map<string, string>();
                (invoicesResponse.data ?? []).forEach((inv: { offer_id: string; invoice_url: string }) => {
                    invoiceMap.set(String(inv.offer_id), inv.invoice_url);
                });

                const mapped = ((offersResponse.data ?? []) as RawOfferRow[]).map((row) => {
                    const item = mapOfferRowToHistoryItem(row, isMember);
                    return { ...item, invoiceUrl: invoiceMap.get(item.id) ?? null };
                });

                if (!cancelled) setOfferHistory(mapped);
            } catch (err) {
                console.error("Failed to load offer history:", describeError(err));
                if (!cancelled) setOfferHistory([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [userId, isMember]);

    const submitOfferDocuments = useCallback(
        async ({
            offerId,
            userId: uid,
            icFile,
            paymentProofFile,
        }: {
            offerId: string;
            userId: string;
            icFile: File;
            paymentProofFile: File | null;
        }): Promise<{ success: true } | { success: false; message: string }> => {
            try {
                const icPath = `offers/${uid}/ic-${Date.now()}-${icFile.name}`;
                const { error: icUploadError } = await supabase.storage.from("property-documents").upload(icPath, icFile);
                if (icUploadError) throw icUploadError;

                let proofPathValue: string | null = null;
                if (paymentProofFile) {
                    const proofPath = `offers/${uid}/proof-${Date.now()}-${paymentProofFile.name}`;
                    const { error: proofUploadError } = await supabase.storage.from("property-documents").upload(proofPath, paymentProofFile);
                    if (!proofUploadError) proofPathValue = proofPath;
                }

                const { data, error } = await supabase
                    .from("offers")
                    .update({
                        ic_upload_url: icPath,
                        payment_proof_url: proofPathValue,
                        status: "Under Verification",
                    })
                    .eq("id", offerId)
                    .eq("user_id", uid)
                    .select("id, ic_upload_url, payment_proof_url, status");

                if (error) throw error;
                if (!data || data.length === 0) {
                    throw new Error("No matching offer was found to update. Please select an offer from the list.");
                }

                const updated = data[0] as {
                    id: string;
                    ic_upload_url: string | null;
                    payment_proof_url: string | null;
                    status: string | null;
                };

                setOfferHistory((prev) =>
                    prev.map((item) =>
                        item.id === String(updated.id)
                            ? {
                                ...item,
                                icDocumentUrl: updated.ic_upload_url,
                                paymentProofUrl: updated.payment_proof_url,
                                status: (updated.status as OfferHistoryItem["status"]) ?? item.status
                            }
                            : item
                    )
                );

                return { success: true };
            } catch (err) {
                const message = err instanceof Error ? err.message : "An unexpected error occurred";
                return { success: false, message };
            }
        },
        []
    );

    return { offerHistory, loading, submitOfferDocuments };
}
