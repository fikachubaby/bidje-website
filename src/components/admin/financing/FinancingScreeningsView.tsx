"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, FileText, Loader2, Lock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    APPLICANT_TYPE_META,
    COMPANY_KIND_LABELS,
    SCREENING_STATUSES,
    SCREENING_STATUS_META,
    requiredDocuments,
    type FinancingScreening,
    type ReviewDecision,
    type ScreeningStatus,
} from "@/constants/financing-screening";

interface AdminScreening extends FinancingScreening {
    applicant: { name: string | null; email: string | null; phone: string | null };
    documentsPurgedAt: string | null;
}

const TONE_CLASS: Record<string, string> = {
    neutral: "bg-neutral-100 text-neutral-700",
    amber: "bg-amber-100 text-amber-800",
    blue: "bg-sky-100 text-sky-800",
    green: "bg-emerald-100 text-emerald-800",
    red: "bg-red-100 text-red-800",
};

const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("en-MY", { dateStyle: "medium", timeStyle: "short" }) : "—";

export function FinancingScreeningsView() {
    const [filter, setFilter] = useState<ScreeningStatus | "all">("under_review");
    const [rows, setRows] = useState<AdminScreening[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/financing-screenings${filter === "all" ? "" : `?status=${filter}`}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setRows(data.screenings);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not load screenings");
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                {(["all", ...SCREENING_STATUSES] as const).map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => setFilter(s)}
                        className={cn(
                            "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                            filter === s ? "bg-black text-white" : "bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50"
                        )}
                    >
                        {s === "all" ? "All" : SCREENING_STATUS_META[s].label}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={() => void load()}
                    className="ml-auto rounded-full p-2 text-neutral-500 hover:bg-white"
                    aria-label="Refresh"
                >
                    <RefreshCw className="h-4 w-4" />
                </button>
            </div>

            <p className="flex items-center gap-2 text-xs text-neutral-500">
                <Lock className="h-3.5 w-3.5" /> Confidential financial data. Document links expire after 5 minutes; don&apos;t download or forward them.
            </p>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
            ) : rows.length === 0 ? (
                <div className="dashboard-card text-center text-sm text-neutral-500">No screenings in this status.</div>
            ) : (
                <div className="space-y-3">
                    {rows.map((row) => (
                        <ScreeningCard key={row.id} row={row} onChanged={load} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ScreeningCard({ row, onChanged }: { row: AdminScreening; onChanged: () => void }) {
    const [links, setLinks] = useState<Record<string, string | null> | null>(null);
    const [loadingLinks, setLoadingLinks] = useState(false);
    const [remark, setRemark] = useState(row.staffRemark ?? "");
    const [saving, setSaving] = useState<ReviewDecision | null>(null);
    const meta = SCREENING_STATUS_META[row.status];
    const docs = requiredDocuments(row.applicantType, row.companyKind);
    const canDecide = Boolean(row.feePaidAt) && ["under_review", "additional_documents_required"].includes(row.status);

    async function openDocuments() {
        setLoadingLinks(true);
        try {
            const res = await fetch(`/api/admin/financing-screenings/${row.id}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setLinks(Object.fromEntries((data.links as { id: string; url: string | null }[]).map((l) => [l.id, l.url])));
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not open documents");
        } finally {
            setLoadingLinks(false);
        }
    }

    async function decide(status: ReviewDecision) {
        setSaving(status);
        try {
            const res = await fetch(`/api/admin/financing-screenings/${row.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status, remark: remark.trim() || undefined }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success(`Marked as "${SCREENING_STATUS_META[status].label}"`);
            onChanged();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not save decision");
        } finally {
            setSaving(null);
        }
    }

    return (
        <article className="dashboard-card space-y-4">
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-base font-bold text-black">{row.applicant.name || "Unnamed purchaser"}</p>
                    <p className="text-xs text-neutral-500">
                        {row.applicant.email} {row.applicant.phone && `· ${row.applicant.phone}`}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600">
                        {APPLICANT_TYPE_META[row.applicantType].label}
                        {row.companyKind && ` (${COMPANY_KIND_LABELS[row.companyKind]})`} · RM{row.feeAmount}{" "}
                        {row.feePaidAt ? `paid ${fmtDate(row.feePaidAt)}` : "unpaid"}
                    </p>
                    <p className="text-xs text-neutral-400">Consent recorded {fmtDate(row.consentAt)}</p>
                </div>
                <span className={cn("rounded-full px-3 py-1 text-xs font-bold", TONE_CLASS[meta.tone])}>{meta.label}</span>
            </header>

            <div className="rounded-xl bg-neutral-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Documents ({row.documents.length})</p>
                    {row.documents.length > 0 && !links && (
                        <button
                            type="button"
                            onClick={openDocuments}
                            disabled={loadingLinks}
                            className="flex items-center gap-1 text-xs font-semibold text-black hover:underline"
                        >
                            {loadingLinks && <Loader2 className="h-3 w-3 animate-spin" />} Open secure links
                        </button>
                    )}
                </div>
                {row.documentsPurgedAt ? (
                    <p className="text-xs text-neutral-500">Deleted under retention policy on {fmtDate(row.documentsPurgedAt)}.</p>
                ) : (
                    <ul className="space-y-2">
                        {docs.map((d) => {
                            const files = row.documents.filter((f) => f.docKey === d.key);
                            return (
                                <li key={d.key} className="text-xs">
                                    <span className={cn("font-semibold", files.length ? "text-black" : "text-red-600")}>
                                        {d.label}
                                        {!files.length && (d.optional ? " (not provided)" : " (missing)")}
                                    </span>
                                    {files.map((f) => (
                                        <span key={f.id} className="mt-1 flex items-center gap-1.5 pl-3 text-neutral-600">
                                            <FileText className="h-3 w-3 shrink-0" />
                                            {links?.[f.id] ? (
                                                <a
                                                    href={links[f.id]!}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 truncate underline"
                                                >
                                                    {f.fileName} <ExternalLink className="h-3 w-3" />
                                                </a>
                                            ) : (
                                                <span className="truncate">{f.fileName}</span>
                                            )}
                                        </span>
                                    ))}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {canDecide && (
                <div className="space-y-3">
                    <textarea
                        rows={2}
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="Remark shown to the purchaser (required when asking for more documents)"
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    <div className="flex flex-wrap gap-2">
                        <DecisionButton label="Eligible to proceed" tone="bg-emerald-600 text-white hover:bg-emerald-700" busy={saving === "eligible"} onClick={() => decide("eligible")} />
                        <DecisionButton label="Request documents" tone="bg-amber-100 text-amber-900 hover:bg-amber-200" busy={saving === "additional_documents_required"} onClick={() => decide("additional_documents_required")} />
                        <DecisionButton label="Not eligible" tone="bg-red-50 text-red-700 hover:bg-red-100" busy={saving === "not_eligible"} onClick={() => decide("not_eligible")} />
                    </div>
                </div>
            )}
        </article>
    );
}

function DecisionButton({ label, tone, busy, onClick }: { label: string; tone: string; busy: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={busy}
            className={cn("flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors disabled:opacity-50", tone)}
        >
            {busy && <Loader2 className="h-3 w-3 animate-spin" />}
            {label}
        </button>
    );
}
