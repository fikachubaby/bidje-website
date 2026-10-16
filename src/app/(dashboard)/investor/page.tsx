"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { money, overallProgress, projectedProfit, STAGE_BADGE, STAGE_LABELS, totalCost } from "@/lib/investor";
import type { InvestorProperty, InvestorStage } from "@/types/investor";
import { JourneyProgress } from "./_components/JourneyProgress";
import { PropertyDetail } from "./_components/PropertyDetail";
import { daysUntil, RemindersSpotlight, type UpcomingReminder } from "./_components/RemindersSpotlight";

function Metric({ label, value, hint, highlight }: { label: string; value: string | number; hint?: string; highlight?: boolean }) {
    return (
        <div className={cn("min-w-0 rounded-2xl border p-3.5 shadow-sm sm:p-4", highlight ? "border-black bg-neutral-950 text-white" : "border-neutral-200 bg-white")}>
            <p className={cn("text-[11px] font-bold uppercase tracking-wide", highlight ? "text-brand" : "text-neutral-500")}>{label}</p>
            <p className="mt-1.5 break-words text-lg font-black leading-tight tracking-tight sm:text-2xl">{value}</p>
            {hint && <p className={cn("mt-1 text-xs", highlight ? "text-neutral-400" : "text-neutral-500")}>{hint}</p>}
        </div>
    );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
    return <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center">{children}</div>;
}

export default function InvestorPortalPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [investorName, setInvestorName] = useState("");
    const [properties, setProperties] = useState<InvestorProperty[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
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
            (p) => (stage === "all" || p.stage === stage) && (!q || `${p.address} ${p.state ?? ""}`.toLowerCase().includes(q))
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

    const upcoming: UpcomingReminder[] = useMemo(
        () =>
            properties
                .flatMap((p) => p.reminders.filter((r) => r.status === "scheduled").map((r) => ({ ...r, property: p })))
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
        [properties]
    );
    const reminderCount = (id: string) => upcoming.filter((r) => r.property.id === id && daysUntil(r.dueDate) <= 7).length;

    const selected = properties.find((p) => p.id === selectedId) ?? null;
    const countBy = (s: InvestorStage) => properties.filter((p) => p.stage === s).length;

    const openProperty = (id: string) => {
        setSelectedId(id);
        // On phones the detail sits below the list, so bring it into view.
        if (window.innerWidth < 1024) {
            requestAnimationFrame(() => document.getElementById("property-detail")?.scrollIntoView({ behavior: "smooth" }));
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    if (error) {
        return (
            <CenteredCard>
                <p className="font-bold">{error}</p>
                <Link href="/login" className="mt-4 inline-block text-sm font-bold underline">
                    Sign in
                </Link>
            </CenteredCard>
        );
    }

    if (!properties.length) {
        return (
            <CenteredCard>
                <h1 className="text-xl font-black">No investment properties yet</h1>
                <p className="mt-2 text-sm text-neutral-500">
                    Once the Bidje team adds your properties, you can follow their legal, renovation and sales progress here.
                </p>
            </CenteredCard>
        );
    }

    return (
        <div className="space-y-5 pb-4 sm:space-y-6 sm:pb-8">
            {/* Greeting */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                        Hi{investorName ? `, ${investorName.split(" ")[0]}` : ""} 👋
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Here&apos;s how your {properties.length} propert{properties.length === 1 ? "y is" : "ies are"} doing.
                    </p>
                </div>
            </div>

            {/* Money at a glance */}
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metric
                    label="Projected profit"
                    value={totals.pricedCount ? money(totals.profit) : "Pending"}
                    hint={totals.pricedCount ? `ROI ${totals.roi.toFixed(1)}% · before tax` : "Shown once target prices are set"}
                    highlight
                />
                <Metric label="Total invested" value={totals.invested ? money(totals.invested) : "Pending"} hint="Purchase, legal, renovation & other" />
                <Metric
                    label="Target sale value"
                    value={totals.target ? money(totals.target) : "Pending"}
                    hint={`${totals.pricedCount} of ${properties.length} priced`}
                />
                <Metric
                    label="Properties"
                    value={properties.length}
                    hint={`${countBy("legal")} legal · ${countBy("renovation")} reno · ${countBy("for_sale")} for sale`}
                />
            </section>

            <RemindersSpotlight reminders={upcoming} onOpen={openProperty} />

            {/* List + detail */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
                <section className="min-w-0 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <div className="space-y-3 border-b border-neutral-100 p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by address or state..."
                                className="w-full rounded-xl border border-neutral-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-900"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {(["all", ...Object.keys(STAGE_LABELS)] as (InvestorStage | "all")[]).map((s) => {
                                const count = s === "all" ? properties.length : countBy(s);
                                if (s !== "all" && !count) return null;
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStage(s)}
                                        className={cn(
                                            "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
                                            stage === s ? "bg-black text-brand" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                        )}
                                    >
                                        {s === "all" ? "All" : STAGE_LABELS[s]} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <ul className="max-h-[640px] space-y-2 overflow-y-auto p-3">
                        {filtered.length === 0 && <li className="p-4 text-sm text-neutral-500">No properties match.</li>}
                        {filtered.map((p) => {
                            const due = reminderCount(p.id);
                            return (
                                <li key={p.id}>
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => openProperty(p.id)}
                                        onKeyDown={(e) => e.key === "Enter" && openProperty(p.id)}
                                        className={cn(
                                            "cursor-pointer rounded-xl border p-3.5 transition hover:shadow-md",
                                            p.id === selectedId ? "border-black ring-2 ring-brand" : "border-neutral-200"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-bold leading-snug text-neutral-900">{p.address}</p>
                                            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black", STAGE_BADGE[p.stage])}>
                                                {STAGE_LABELS[p.stage]}
                                            </span>
                                        </div>
                                        <div className="mt-3">
                                            <JourneyProgress property={p} compact />
                                        </div>
                                        <div className="mt-2 flex items-center justify-between text-xs">
                                            <span className="font-bold text-neutral-700">{overallProgress(p)}% complete</span>
                                            <span className="flex items-center gap-2">
                                                {due > 0 && (
                                                    <span className="inline-flex items-center gap-1 font-bold text-red-600">
                                                        <Bell className="animate-bell-ring h-3 w-3 origin-top" /> {due} due soon
                                                    </span>
                                                )}
                                                {p.targetPrice > 0 && (
                                                    <span className={cn("font-black", projectedProfit(p) < 0 ? "text-red-600" : "text-emerald-700")}>
                                                        {money(projectedProfit(p))}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <div id="property-detail" className="min-w-0 scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
                    {selected ? (
                        <PropertyDetail property={selected} />
                    ) : (
                        <CenteredCard>
                            <p className="text-sm text-neutral-500">Choose a property to see its details.</p>
                        </CenteredCard>
                    )}
                </div>
            </div>
        </div>
    );
}
