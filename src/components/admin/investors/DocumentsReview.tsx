"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/ButtonProps";
import { cn } from "@/lib/utils";
import { formatDate, money } from "@/lib/investor";

interface ExtractedLine {
    id: string;
    date: string | null;
    description: string;
    amount: number;
    category: "purchase" | "legal" | "renovation" | "other" | "unrelated";
    confidence: number | null;
    included: boolean;
}

interface ReviewDocument {
    id: string;
    fileName: string;
    status: "processing" | "pending_review" | "approved" | "rejected" | "failed";
    aiSummary: string | null;
    error: string | null;
    createdAt: string;
    url: string | null;
    transactions: ExtractedLine[];
}

/** Admin checks the lines AI pulled from investor uploads; approving adds them to the property's costs. */
export function DocumentsReview({ propertyId, onReviewed }: { propertyId: string; onReviewed: () => Promise<void> }) {
    const [documents, setDocuments] = useState<ReviewDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [ticked, setTicked] = useState<Record<string, Set<string>>>({});
    const [busy, setBusy] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch(`/api/admin/investor-properties/${propertyId}/documents`);
        const data = await res.json();
        const docs: ReviewDocument[] = data.documents ?? [];
        setDocuments(docs);
        setTicked(
            Object.fromEntries(
                docs.map((d) => [d.id, new Set(d.transactions.filter((t) => t.included).map((t) => t.id))])
            )
        );
        setLoading(false);
    }, [propertyId]);

    useEffect(() => {
        void load();
    }, [load]);

    const toggle = (docId: string, lineId: string) =>
        setTicked((prev) => {
            const next = new Set(prev[docId]);
            if (next.has(lineId)) next.delete(lineId);
            else next.add(lineId);
            return { ...prev, [docId]: next };
        });

    const review = async (docId: string, action: "approve" | "reject") => {
        setBusy(docId);
        try {
            const res = await fetch(`/api/admin/investor-documents/${docId}/review`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, includedIds: [...(ticked[docId] ?? [])] }),
            });
            if (!res.ok) throw new Error((await res.json()).error ?? "Review failed");
            toast.success(action === "approve" ? "Costs added to the property" : "Document rejected");
            await Promise.all([load(), onReviewed()]);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Review failed");
        } finally {
            setBusy(null);
        }
    };

    if (loading) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-neutral-400" />;
    if (!documents.length) return <p className="text-sm text-neutral-500">The investor hasn&apos;t uploaded any documents yet.</p>;

    return (
        <div className="space-y-4">
            {documents.map((d) => {
                const pending = d.status === "pending_review";
                const selected = ticked[d.id] ?? new Set<string>();
                const total = d.transactions.filter((t) => selected.has(t.id) && t.category !== "unrelated").reduce((s, t) => s + t.amount, 0);
                return (
                    <div key={d.id} className="rounded-2xl border border-neutral-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="flex items-center gap-2 text-sm font-bold">
                                    {d.fileName}
                                    {d.url && (
                                        <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-black">
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                </p>
                                <p className="text-xs text-neutral-500">
                                    {formatDate(d.createdAt)} · {d.status.replace("_", " ")}
                                    {d.aiSummary ? ` · ${d.aiSummary}` : ""}
                                    {d.error ? ` · ${d.error}` : ""}
                                </p>
                            </div>
                        </div>

                        {d.transactions.length > 0 && (
                            <table className="mt-3 w-full text-left text-xs">
                                <tbody>
                                    {d.transactions.map((t) => (
                                        <tr key={t.id} className={cn("border-t border-neutral-100", t.category === "unrelated" && "text-neutral-400")}>
                                            <td className="py-2 pr-2">
                                                <input
                                                    type="checkbox"
                                                    disabled={!pending || t.category === "unrelated"}
                                                    checked={selected.has(t.id)}
                                                    onChange={() => toggle(d.id, t.id)}
                                                />
                                            </td>
                                            <td className="whitespace-nowrap py-2 pr-2">{t.date ? formatDate(t.date) : "—"}</td>
                                            <td className="py-2 pr-2">{t.description}</td>
                                            <td className="py-2 pr-2 capitalize">
                                                {t.category}
                                                {t.confidence !== null && t.confidence < 0.6 && (
                                                    <span className="ml-1 text-amber-600">(unsure)</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap py-2 text-right font-bold">{money(t.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {pending && (
                            <div className="mt-3 flex items-center justify-between gap-2">
                                <p className="text-xs text-neutral-500">
                                    Approving adds <b>{money(total)}</b> to this property&apos;s costs.
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" disabled={busy === d.id} onClick={() => review(d.id, "reject")}>
                                        Reject
                                    </Button>
                                    <Button size="sm" disabled={busy === d.id} onClick={() => review(d.id, "approve")}>
                                        Approve
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
