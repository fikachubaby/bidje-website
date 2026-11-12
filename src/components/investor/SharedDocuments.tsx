"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, FileText, FileUp, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/investor";

interface SharedDocument {
    id: string;
    fileName: string;
    createdAt: string;
    url: string | null;
}

interface SharedDocumentsProps {
    propertyId: string;
    /** Admin can upload and delete; the investor only views and downloads. */
    manage?: boolean;
}

/** Documents Bidje uploads for the investor (SPA, title, reports...). */
export function SharedDocuments({ propertyId, manage = false }: SharedDocumentsProps) {
    const baseUrl = manage
        ? `/api/admin/investor-properties/${propertyId}/shared-documents`
        : `/api/investor/shared-documents?propertyId=${propertyId}`;

    const [documents, setDocuments] = useState<SharedDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await fetch(baseUrl);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setDocuments(data.documents ?? []);
        } catch {
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    }, [baseUrl]);

    useEffect(() => {
        void load();
    }, [load]);

    const run = async (request: () => Promise<Response>, success: string) => {
        setBusy(true);
        try {
            const res = await request();
            if (!res.ok) throw new Error((await res.json()).error ?? "Something went wrong");
            toast.success(success);
            await load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setBusy(false);
        }
    };

    const upload = (file: File) => {
        const form = new FormData();
        form.append("file", file);
        return run(() => fetch(baseUrl, { method: "POST", body: form }), "Document uploaded");
    };

    const remove = (doc: SharedDocument) =>
        confirm(`Delete "${doc.fileName}"? The investor will no longer see it.`) &&
        run(() => fetch(`${baseUrl}?docId=${doc.id}`, { method: "DELETE" }), "Document deleted");

    return (
        <div className="space-y-3">
            {manage && (
                <label
                    className={cn(
                        "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 p-4 text-sm font-bold hover:border-neutral-500",
                        busy && "pointer-events-none opacity-60"
                    )}
                >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                    {busy ? "Working..." : "Upload document for investor"}
                    <span className="font-normal text-neutral-500">(PDF, JPG, PNG · max 10 MB)</span>
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
            )}

            {loading ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-neutral-400" />
            ) : documents.length === 0 ? (
                <p className="text-sm text-neutral-500">No documents shared yet.</p>
            ) : (
                <ul className="space-y-2">
                    {documents.map((d) => (
                        <li key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3">
                            <div className="flex min-w-0 items-center gap-2">
                                <FileText className="h-4 w-4 shrink-0 text-neutral-500" />
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold">{d.fileName}</p>
                                    <p className="text-xs text-neutral-500">{formatDate(d.createdAt)}</p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                                {d.url && (
                                    <a
                                        href={d.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold underline hover:bg-neutral-100"
                                    >
                                        View <ExternalLink className="h-3 w-3" />
                                    </a>
                                )}
                                {manage && (
                                    <button
                                        type="button"
                                        className="admin-action-btn"
                                        title="Delete"
                                        disabled={busy}
                                        onClick={() => remove(d)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
