"use client";

import { useState } from "react";
import { CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { SUBSCRIBER_PLAN } from "@/lib/subscriptions/plan";
import type { useSubscription } from "@/hooks/useSubscription";

const STATUS = {
    active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    past_due: { label: "Payment issue", className: "bg-amber-50 text-amber-700 border-amber-200" },
    expired: { label: "Expired", className: "bg-red-50 text-red-700 border-red-200" },
    cancelled: { label: "Cancelled", className: "bg-neutral-100 text-neutral-600 border-neutral-200" },
    none: { label: "Not subscribed", className: "bg-neutral-100 text-neutral-600 border-neutral-200" },
} as const;

const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export function SubscriptionCard({ billing }: { billing: ReturnType<typeof useSubscription> }) {
    const { subscription: sub, payments, loading, busy, checkout, setAutoRenew } = billing;
    const [showHistory, setShowHistory] = useState(false);

    if (loading || !sub) {
        return (
            <div className="grid h-48 place-items-center rounded-3xl border border-neutral-200 bg-white">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
        );
    }

    const isLive = sub.status === "active" || sub.status === "past_due";
    const status = STATUS[sub.status];

    return (
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="rounded-2xl bg-black p-2.5 text-brand">
                        <ShieldCheck className="h-5 w-5" />
                    </span>
                    <div>
                        <h2 className="text-base font-black">{sub.planName}</h2>
                        <p className="text-xs text-neutral-500">{SUBSCRIBER_PLAN.description}</p>
                    </div>
                </div>
                <span className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-black", status.className)}>{status.label}</span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-neutral-50 p-3">
                    <p className="text-[11px] font-bold uppercase text-neutral-500">Price</p>
                    <p className="mt-1 font-black">
                        RM {sub.price.toFixed(2)} <span className="text-xs font-normal text-neutral-500">/ month</span>
                    </p>
                </div>
                <div className="rounded-2xl bg-neutral-50 p-3">
                    <p className="text-[11px] font-bold uppercase text-neutral-500">
                        {isLive ? (sub.autoRenew ? "Renews on" : "Access until") : "Status"}
                    </p>
                    <p className="mt-1 font-black">{isLive ? fmt(sub.currentPeriodEnd) : status.label}</p>
                </div>
            </div>

            {sub.status === "past_due" && (
                <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs text-amber-800">
                    We couldn&apos;t charge your card. We&apos;ll retry automatically — or pay now to avoid losing access.
                </p>
            )}

            {isLive && (
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-neutral-200 p-3">
                    <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-neutral-500" />
                        <div>
                            <p className="font-bold">Auto-renew</p>
                            <p className="text-xs text-neutral-500">
                                {sub.hasSavedCard ? sub.cardLabel ?? "Saved card" : "Saved card will be added on your next payment"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={sub.autoRenew}
                        disabled={busy}
                        onClick={() => setAutoRenew(!sub.autoRenew)}
                        className={cn(
                            "relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50",
                            sub.autoRenew ? "bg-emerald-500" : "bg-neutral-300"
                        )}
                    >
                        <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all", sub.autoRenew ? "left-6" : "left-1")} />
                    </button>
                </div>
            )}

            {(!isLive || sub.status === "past_due" || !sub.hasSavedCard) && (
                <button
                    type="button"
                    onClick={checkout}
                    disabled={busy}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-3 text-sm font-bold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                >
                    {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                    {sub.status === "none"
                        ? `Subscribe — RM ${SUBSCRIBER_PLAN.price.toFixed(2)}/month`
                        : sub.status === "active"
                          ? "Pay next month early & save card"
                          : "Renew now"}
                </button>
            )}

            {payments.length > 0 && (
                <div className="mt-4">
                    <button type="button" onClick={() => setShowHistory((v) => !v)} className="text-xs font-bold underline">
                        {showHistory ? "Hide" : "Show"} payment history ({payments.length})
                    </button>
                    {showHistory && (
                        <ul className="mt-2 divide-y divide-neutral-100 text-xs">
                            {payments.map((p) => (
                                <li key={p.id} className="flex justify-between py-2">
                                    <span>{fmt(p.paidAt ?? p.createdAt)}</span>
                                    <span className={p.status === "success" ? "font-bold" : "text-red-600"}>
                                        RM {p.amount.toFixed(2)} · {p.status === "success" ? "Paid" : "Failed"}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <p className="mt-4 text-[11px] leading-relaxed text-neutral-400">
                Payments are processed securely by Fiuu. You can turn off auto-renew anytime and keep access until the end of your paid period.
            </p>
        </section>
    );
}
