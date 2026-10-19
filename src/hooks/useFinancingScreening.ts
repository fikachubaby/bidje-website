"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { postToGateway } from "@/lib/payments/postToGateway";
import type {
    ApplicantType,
    CompanyKind,
    FinancingScreening,
    ScreeningDocument,
} from "@/constants/financing-screening";

async function call<T>(input: string, init?: RequestInit): Promise<T> {
    const res = await fetch(input, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
    return data as T;
}

const json = (method: string, body: unknown): RequestInit => ({
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
});

/** The signed-in purchaser's financing screening, plus the actions that move it forward. */
export function useFinancingScreening(enabled: boolean) {
    const [screening, setScreening] = useState<FinancingScreening | null>(null);
    const [loading, setLoading] = useState(enabled);
    const [busy, setBusy] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!enabled) return;
        try {
            const data = await call<{ screening: FinancingScreening | null }>("/api/financing-screening");
            setScreening(data.screening);
        } catch {
            // Treated as "not started"; the user can retry from the first step.
        } finally {
            setLoading(false);
        }
    }, [enabled]);

    useEffect(() => {
        setLoading(enabled);
        void refresh();
    }, [enabled, refresh]);

    async function run(fn: () => Promise<void>) {
        setBusy(true);
        try {
            await fn();
            return true;
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Something went wrong");
            return false;
        } finally {
            setBusy(false);
        }
    }

    const start = (applicantType: ApplicantType, companyKind: CompanyKind | null) =>
        run(async () => {
            const data = await call<{ screening: FinancingScreening }>(
                "/api/financing-screening",
                json("POST", { applicantType, companyKind })
            );
            setScreening(data.screening);
        });

    async function upload(docKey: string, files: FileList | File[]) {
        if (!screening) return;
        setUploading(docKey);
        try {
            for (const file of Array.from(files)) {
                const body = new FormData();
                body.set("screeningId", screening.id);
                body.set("docKey", docKey);
                body.set("file", file);
                const { document } = await call<{ document: ScreeningDocument }>(
                    "/api/financing-screening/documents",
                    { method: "POST", body }
                );
                setScreening((s) => (s ? { ...s, documents: [...s.documents, document] } : s));
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(null);
        }
    }

    const remove = (docId: string) =>
        run(async () => {
            await call(`/api/financing-screening/documents?id=${docId}`, { method: "DELETE" });
            setScreening((s) => (s ? { ...s, documents: s.documents.filter((d) => d.id !== docId) } : s));
        });

    const consent = () =>
        run(async () => {
            const data = await call<{ screening: FinancingScreening }>(
                "/api/financing-screening",
                json("PATCH", {
                    id: screening?.id,
                    action: "consent",
                    consents: { assessment: true, fee: true, bankDecision: true },
                })
            );
            setScreening(data.screening);
        });

    const resubmit = () =>
        run(async () => {
            const data = await call<{ screening: FinancingScreening }>(
                "/api/financing-screening",
                json("PATCH", { id: screening?.id, action: "resubmit" })
            );
            setScreening(data.screening);
        });

    /** Leaves the site for Fiuu; on return the page reopens the offer with `?screening=`. */
    async function pay(returnPath: string) {
        setBusy(true);
        try {
            const { checkout } = await call<{ checkout: { actionUrl: string; fields: Record<string, string> } }>(
                "/api/financing-screening/checkout",
                json("POST", { screeningId: screening?.id, returnPath })
            );
            postToGateway(checkout.actionUrl, checkout.fields);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not start payment");
            setBusy(false);
        }
    }

    return { screening, loading, busy, uploading, refresh, start, upload, remove, consent, resubmit, pay };
}
