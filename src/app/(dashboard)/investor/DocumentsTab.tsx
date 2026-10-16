"use client";

import { useCallback, useEffect, useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/investor";

interface UploadedDocument {
    id: string;
    file_name: string;
    status: "processing" | "pending_review" | "approved" | "rejected" | "failed";
    ai_summary: string | null;
    created_at: string;
}

const STATUS: Record<UploadedDocument["status"], { label: string; className: string }> = {
    processing: { label: "Reading...", className: "bg-neutral-100 text-neutral-600" },
    pending_review: { label: "Awaiting Bidje review", className: "bg-amber-50 text-amber-700" },
    approved: { label: "Verified", className: "bg-emerald-50 text-emerald-700" },
    rejected: { label: "Not used", className: "bg-neutral-100 text-neutral-500" },
    failed: { label: "Couldn't read", className: "bg-red-50 text-red-700" },
};

/** Investor uploads bank statements / receipts; AI pre-fills the costs for Bidje to verify. */
export function DocumentsTab({ propertyId }: { propertyId: string }) {
    const [documents, setDocuments] = useState<UploadedDocument[]>([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const res = await fetch(`/api/investor/documents?propertyId=${propertyId}`);
        const data = await res.json();
        setDocuments(data.documents ?? []);
    }, [propertyId]);

    useEffect(() => {
        void load();
    }, [load]);

    const upload = async (file: File) => {
        setUploading(true);
        setError(null);
        try {
            const form = new FormData();
            form.append("file", file);
            form.append("investorPropertyId", propertyId);
            const res = await fetch("/api/investor/documents", { method: "POST", body: form });
            if (!res.ok) setError((await res.json()).error ?? "Upload failed");
            await load();
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <label
                className={cn(
                    "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 p-6 text-center hover:border-neutral-500",
                    uploading && "pointer-events-none opacity-60"
                )}
            >
                {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileUp className="h-6 w-6" />}
                <span className="text-sm font-bold">
                    {uploading ? "Uploading and reading your document..." : "Upload bank statement or receipt"}
                </span>
                <span className="text-xs text-neutral-500">
                    PDF, JPG or PNG up to 10 MB. Payments for this property are picked out automatically and checked by
                    Bidje before they appear in your figures.
                </span>
                <input
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) void upload(f);
                    }}
                />
            </label>
            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

            <ul className="space-y-2">
                {documents.map((d) => (
                    <li key={d.id} className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 p-3">
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold">{d.file_name}</p>
                            <p className="text-xs text-neutral-500">
                                {formatDate(d.created_at)}
                                {d.ai_summary ? ` · ${d.ai_summary}` : ""}
                            </p>
                        </div>
                        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black", STATUS[d.status].className)}>
                            {STATUS[d.status].label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
