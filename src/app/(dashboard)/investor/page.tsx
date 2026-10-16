"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BellRing, Check, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDueIn } from "@/lib/reminders";
import {
    categoryProgress,
    formatDate,
    money,
    overallProgress,
    projectedProfit,
    STAGE_BADGE,
    STAGE_LABELS,
    totalCost,
} from "@/lib/investor";
import type { InvestorProperty, InvestorStage, MilestoneCategory } from "@/types/investor";

type Tab = "overview" | MilestoneCategory | "financial" | "updates";

function Bar({ value }: { value: number }) {
    return (
        <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
        </div>
    );
}

function Metric({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">{label}</p>
            <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
            {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
        </div>
    );
}

function Checklist({ property, category }: { property: InvestorProperty; category: MilestoneCategory }) {
    const items = property.milestones.filter((m) => m.category === category);
    const pct = categoryProgress(property.milestones, category);
    return (
        <div className="space-y-4">
            <div className="rounded-2xl border border-neutral-200 p-4">
                <div className="mb-2 flex justify-between text-sm font-bold capitalize">
                    <span>{category} progress</span>
                    <span>{pct}%</span>
                </div>
                <Bar value={pct} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
                {items.map((m) => (
                    <div
                        key={m.id}
                        className={cn(
                            "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm",
                            m.done ? "border-emerald-200 bg-emerald-50" : "border-neutral-200"
                        )}
                    >
                        <span
                            className={cn(
                                "grid h-5 w-5 shrink-0 place-items-center rounded-full",
                                m.done ? "bg-emerald-600 text-white" : "bg-neutral-100"
                            )}
                        >
                            {m.done && <Check className="h-3 w-3" />}
                        </span>
                        <span className="flex-1">{m.label}</span>
                        {m.done && m.doneAt && <span className="text-[11px] text-neutral-500">{formatDate(m.doneAt)}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function InvestorPortalPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [investorName, setInvestorName] = useState("");
    const [properties, setProperties] = useState<InvestorProperty[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [tab, setTab] = useState<Tab>("overview");
    const [search, setSearch] = useState("");
    const [stage, setStage] = useState<InvestorStage | "all">("all");

    useEffect(() => {
        fetch("/api/investor/portfolio")
            .then(async (res) => {
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to load portfolio");
                setInvestorName(data.investor?.name ?? "");
                setProperties(data.properties ?? []);
                setSelectedId(data.properties?.[0]?.id ?? null);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return properties.filter(
            (p) =>
                (stage === "all" || p.stage === stage) &&
                (!q || `${p.address} ${p.state ?? ""}`.toLowerCase().includes(q))
        );
    }, [properties, search, stage]);

    const totals = useMemo(() => {
        const invested = properties.reduce((s, p) => s + totalCost(p), 0);
        // Profit only counts properties where Bidje has set a target price.
        const priced = properties.filter((p) => p.targetPrice > 0);
        const target = priced.reduce((s, p) => s + p.targetPrice, 0);
        const profit = priced.reduce((s, p) => s + projectedProfit(p), 0);
        const pricedCost = priced.reduce((s, p) => s + totalCost(p), 0);
        return { invested, target, profit, pricedCount: priced.length, roi: pricedCost ? (profit / pricedCost) * 100 : 0 };
    }, [properties]);

    const upcoming = useMemo(
        () =>
            properties
                .flatMap((p) => p.reminders.filter((r) => r.status === "scheduled").map((r) => ({ ...r, property: p })))
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .slice(0, 6),
        [properties]
    );

    const selected = properties.find((p) => p.id === selectedId) ?? null;

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center">
                <p className="font-bold">{error}</p>
                <Link href="/login" className="mt-4 inline-block text-sm font-bold underline">
                    Sign in
                </Link>
            </div>
        );
    }

    if (!properties.length) {
        return (
            <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center">
                <h1 className="text-xl font-black">No investment properties yet</h1>
                <p className="mt-2 text-sm text-neutral-500">
                    Once the Bidje team adds your properties, you can track their legal, renovation and sales progress here.
                </p>
            </div>
        );
    }

    const countBy = (s: InvestorStage) => properties.filter((p) => p.stage === s).length;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Investment Dashboard</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    {investorName ? `Welcome back, ${investorName}. ` : ""}Track legal, renovation, sales and financial
                    progress in one place.
                </p>
            </div>
            </div>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metric
                    label="Properties"
                    value={properties.length}
                    hint={`${countBy("legal")} legal · ${countBy("renovation")} renovation · ${countBy("for_sale")} for sale`}
                />
                <Metric
                    label="Total invested"
                    value={totals.invested ? money(totals.invested) : "Pending"}
                    hint={totals.invested ? "Purchase, legal, renovation & other" : "Figures not yet updated by Bidje"}
                />
                <Metric
                    label="Target exit value"
                    value={totals.target ? money(totals.target) : "Pending"}
                    hint={`${totals.pricedCount} of ${properties.length} properties priced`}
                />
                <Metric
                    label="Projected profit"
                    value={totals.pricedCount ? money(totals.profit) : "Pending"}
                    hint={totals.pricedCount ? `ROI ${totals.roi.toFixed(1)}% · before tax adjustments` : "Shown once target prices are set"}
                />
            </section>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
                <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search address or state..."
                                className="w-full rounded-xl border border-neutral-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-900"
                            />
                        </div>
                        <select
                            value={stage}
                            onChange={(e) => setStage(e.target.value as InvestorStage | "all")}
                            className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
                        >
                            <option value="all">All stages ({properties.length})</option>
                            {Object.entries(STAGE_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>
                                    {l} ({countBy(v as InvestorStage)})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="grid max-h-[520px] gap-2 overflow-y-auto p-3">
                        {filtered.length === 0 && <p className="p-4 text-sm text-neutral-500">No properties match.</p>}
                        {filtered.map((p) => {
                            const pct = overallProgress(p);
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedId(p.id);
                                        setTab("overview");
                                        document.getElementById("property-detail")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className={cn(
                                        "rounded-xl border p-4 text-left transition-shadow hover:shadow-md",
                                        p.id === selectedId ? "border-yellow-500 ring-1 ring-brand" : "border-neutral-200"
                                    )}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold uppercase text-neutral-500">
                                                {p.refNo ? `No. ${p.refNo} · ` : ""}
                                                {p.state ?? ""}
                                            </p>
                                            <p className="mt-1 text-sm font-bold text-neutral-900">{p.address}</p>
                                        </div>
                                        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black", STAGE_BADGE[p.stage])}>
                                            {STAGE_LABELS[p.stage]}
                                        </span>
                                    </div>
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="flex-1">
                                            <Bar value={pct} />
                                        </div>
                                        <span className="text-xs font-black">{pct}%</span>
                                    </div>
                                    {p.targetPrice > 0 && (
                                        <p className="mt-2 text-xs text-neutral-500">
                                            Projected profit{" "}
                                            <span className={cn("font-black", projectedProfit(p) < 0 ? "text-red-600" : "text-emerald-700")}>
                                                {money(projectedProfit(p))}
                                            </span>
                                        </p>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <aside className="space-y-5">
                    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                        <h2 className="flex items-center gap-2 text-base font-black">
                            <BellRing className="h-4 w-4" /> Upcoming deadlines
                        </h2>
                        <div className="mt-3 space-y-2">
                            {upcoming.length === 0 && <p className="text-sm text-neutral-500">Nothing due right now.</p>}
                            {upcoming.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => setSelectedId(r.property.id)}
                                    className="block w-full rounded-xl border border-neutral-100 p-3 text-left hover:border-neutral-300"
                                >
                                    <p className="text-sm font-bold">{r.title}</p>
                                    <p className="truncate text-xs text-neutral-500">{r.property.address}</p>
                                    <p
                                        className={cn(
                                            "mt-1 text-xs font-bold",
                                            new Date(r.dueDate).getTime() < Date.now() ? "text-red-600" : "text-neutral-700"
                                        )}
                                    >
                                        {formatDate(r.dueDate)} · {formatDueIn(r.dueDate)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                        <h2 className="text-base font-black">Portfolio snapshot</h2>
                        <dl className="mt-3 divide-y divide-neutral-100 text-sm">
                            <div className="flex justify-between py-2">
                                <dt className="text-neutral-500">Total invested</dt>
                                <dd className="font-bold">{totals.invested ? money(totals.invested) : "Pending"}</dd>
                            </div>
                            <div className="flex justify-between py-2">
                                <dt className="text-neutral-500">Target gross sale</dt>
                                <dd className="font-bold">{totals.target ? money(totals.target) : "Pending"}</dd>
                            </div>
                            <div className="flex justify-between py-2">
                                <dt className="text-neutral-500">Projected profit</dt>
                                <dd className={cn("text-lg font-black", totals.profit < 0 && "text-red-600")}>
                                    {totals.pricedCount ? money(totals.profit) : "Pending"}
                                </dd>
                            </div>
                        </dl>
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-neutral-950 p-4 text-white">
                            <span className="text-xs text-neutral-400">PORTFOLIO ROI (PROJECTED)</span>
                            <span className="text-xl font-black text-brand">
                                {totals.pricedCount ? `${totals.roi.toFixed(1)}%` : "—"}
                            </span>
                        </div>
                    </section>
                </aside>
            </div>

            {selected && (
                <section id="property-detail" className="scroll-mt-24 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-[11px] font-bold uppercase text-neutral-500">
                                {selected.refNo ? `No. ${selected.refNo} · ` : ""}Signed{" "}
                                {selected.dateSigned ? formatDate(selected.dateSigned) : selected.dateSignedNote ?? "—"}
                            </p>
                            <h2 className="mt-1 text-xl font-black tracking-tight">{selected.address}</h2>
                            {selected.expectedCompletion && (
                                <p className="mt-1 text-sm text-neutral-500">
                                    Expected completion {formatDate(selected.expectedCompletion)}
                                </p>
                            )}
                        </div>
                        <span className={cn("self-start rounded-full px-3 py-1 text-xs font-black", STAGE_BADGE[selected.stage])}>
                            {STAGE_LABELS[selected.stage]}
                        </span>
                    </div>

                    <div className="-mx-5 my-5 flex gap-5 overflow-x-auto border-b border-neutral-200 px-5">
                        {(["overview", "legal", "renovation", "sales", "financial", "updates"] as Tab[]).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTab(t)}
                                className={cn(
                                    "whitespace-nowrap border-b-[3px] pb-3 text-sm font-bold capitalize",
                                    tab === t ? "border-brand text-black" : "border-transparent text-neutral-500"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {tab === "overview" && (
                        <div className="space-y-5">
                            <div className="grid gap-3 md:grid-cols-3">
                                {(["legal", "renovation", "sales"] as MilestoneCategory[]).map((c) => {
                                    const pct = categoryProgress(selected.milestones, c);
                                    const next = selected.milestones.find((m) => m.category === c && !m.done);
                                    return (
                                        <div key={c} className="rounded-2xl border border-neutral-200 p-4">
                                            <div className="mb-2 flex justify-between text-sm font-bold capitalize">
                                                <span>{c}</span>
                                                <span>{pct}%</span>
                                            </div>
                                            <Bar value={pct} />
                                            <p className="mt-2 text-xs text-neutral-500">
                                                {next ? `Next: ${next.label}` : "All steps completed"}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div>
                                <h3 className="mb-3 text-sm font-black">Latest activity</h3>
                                <Timeline property={selected} limit={4} />
                            </div>
                        </div>
                    )}
                    {(tab === "legal" || tab === "renovation" || tab === "sales") && (
                        <Checklist property={selected} category={tab} />
                    )}
                    {tab === "financial" && (
                        <div className="max-w-xl text-sm">
                            {[
                                ["Purchase price", selected.purchasePrice],
                                ["Legal cost", selected.legalCost],
                                ["Renovation", selected.renovationCost],
                                ["Other expenses", selected.otherCost],
                                ["Estimated selling cost", selected.sellingCost],
                                ["Target exit", selected.targetPrice],
                                ["Highest offer", selected.highestOffer],
                            ].map(([label, value]) => (
                                <div key={label as string} className="flex justify-between border-b border-neutral-100 py-2.5">
                                    <span className="text-neutral-500">{label}</span>
                                    <span className="font-bold">{value ? money(value as number) : "—"}</span>
                                </div>
                            ))}
                            <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-950 p-4 text-white">
                                <span className="text-xs text-neutral-400">ESTIMATED NET PROFIT</span>
                                <span className="text-xl font-black text-brand">
                                    {selected.targetPrice ? money(projectedProfit(selected)) : "Pending"}
                                </span>
                            </div>
                            {selected.targetPrice > 0 && totalCost(selected) > 0 && (
                                <p className="mt-3 text-sm text-neutral-600">
                                    Total cost {money(totalCost(selected))} · Projected ROI{" "}
                                    <b>{((projectedProfit(selected) / totalCost(selected)) * 100).toFixed(1)}%</b>
                                </p>
                            )}
                        </div>
                    )}
                    {tab === "updates" && <Timeline property={selected} />}
                </section>
            )}
        </div>
    );
}

function Timeline({ property, limit }: { property: InvestorProperty; limit?: number }) {
    const items = limit ? property.updates.slice(0, limit) : property.updates;
    if (!items.length) return <p className="text-sm text-neutral-500">No updates yet.</p>;
    return (
        <ol className="space-y-4">
            {items.map((u) => (
                <li key={u.id} className="border-l-2 border-brand pl-4">
                    <p className="text-[11px] font-bold uppercase text-neutral-500">
                        {formatDate(u.createdAt)} · {u.category}
                    </p>
                    <p className="mt-1 text-sm text-neutral-800">{u.message}</p>
                </li>
            ))}
        </ol>
    );
}
