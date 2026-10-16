"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSubscription {
    userId: string;
    name: string;
    email: string;
    phone: string;
    status: "active" | "past_due" | "expired" | "cancelled";
    expiresAt: string | null;
    autoRenew: boolean;
    cardLabel: string | null;
    renewalFailures: number;
    lastPayment: { amount: number; status: string; at: string } | null;
}

const STATUS_STYLE: Record<AdminSubscription["status"], string> = {
    active: "bg-emerald-50 text-emerald-700",
    past_due: "bg-amber-50 text-amber-700",
    expired: "bg-red-50 text-red-700",
    cancelled: "bg-neutral-100 text-neutral-600",
};
const STATUS_LABEL: Record<AdminSubscription["status"], string> = {
    active: "Active",
    past_due: "Payment issue",
    expired: "Expired",
    cancelled: "Cancelled",
};

const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

/** Read-only overview of all subscribers' billing, Fiuu or manually approved. */
export function SubscriptionsTable() {
    const [rows, setRows] = useState<AdminSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/subscriptions?status=${status}`)
            .then((res) => res.json())
            .then((data) => setRows(data.subscriptions ?? []))
            .finally(() => setLoading(false));
    }, [status]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return rows.filter((r) => !q || `${r.name} ${r.email} ${r.phone}`.toLowerCase().includes(q));
    }, [rows, search]);

    const counts = useMemo(
        () => ({
            active: rows.filter((r) => r.status === "active").length,
            autoRenew: rows.filter((r) => r.status === "active" && r.autoRenew).length,
            issues: rows.filter((r) => r.status === "past_due").length,
        }),
        [rows]
    );

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
                {[
                    ["Active", counts.active],
                    ["Auto-renewing", counts.autoRenew],
                    ["Payment issues", counts.issues],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-4">
                        <p className="text-[11px] font-bold uppercase text-neutral-500">{label}</p>
                        <p className="mt-1 text-2xl font-black">{value}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email or phone..."
                        className="w-full rounded-xl border border-neutral-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-900"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-xl border border-neutral-200 px-3 py-2.5 text-sm"
                >
                    <option value="all">All statuses</option>
                    {Object.entries(STATUS_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>
                            {l}
                        </option>
                    ))}
                </select>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
                <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold text-neutral-500">
                        <tr>
                            <th className="px-4 py-3">Subscriber</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Access until</th>
                            <th className="px-4 py-3">Auto-renew</th>
                            <th className="px-4 py-3">Last payment</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center">
                                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-neutral-400" />
                                </td>
                            </tr>
                        )}
                        {!loading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                                    No subscriptions yet.
                                </td>
                            </tr>
                        )}
                        {!loading &&
                            filtered.map((r) => (
                                <tr key={r.userId} className="border-b border-neutral-100 last:border-0">
                                    <td className="px-4 py-3">
                                        <p className="font-bold">{r.name}</p>
                                        <p className="text-xs text-neutral-500">
                                            {r.email}
                                            {r.phone ? ` · ${r.phone}` : ""}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-black", STATUS_STYLE[r.status])}>
                                            {STATUS_LABEL[r.status]}
                                        </span>
                                        {r.renewalFailures > 0 && (
                                            <p className="mt-1 text-[11px] text-amber-700">{r.renewalFailures} failed attempt(s)</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{fmt(r.expiresAt)}</td>
                                    <td className="px-4 py-3">
                                        {r.autoRenew ? (
                                            <span className="font-bold text-emerald-700">On</span>
                                        ) : (
                                            <span className="text-neutral-500">Off</span>
                                        )}
                                        <p className="text-xs text-neutral-500">{r.cardLabel ?? "No saved card"}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        {r.lastPayment ? (
                                            <>
                                                <p className={r.lastPayment.status === "success" ? "font-bold" : "font-bold text-red-600"}>
                                                    RM {r.lastPayment.amount.toFixed(2)} · {r.lastPayment.status === "success" ? "Paid" : "Failed"}
                                                </p>
                                                <p className="text-xs text-neutral-500">{fmt(r.lastPayment.at)}</p>
                                            </>
                                        ) : (
                                            <span className="text-xs text-neutral-500">Manual approval</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
