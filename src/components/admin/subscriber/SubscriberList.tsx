"use client";

import { useState } from "react";
import type { SubscriptionRequest, RequestStatus } from "@/types/subscriber";
import {
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Search,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import { cn } from "@/lib/utils";

interface SubscriberListProps {
    requests: SubscriptionRequest[];
    loading: boolean;
    page: number;
    setPage: (page: number) => void;
    totalPages: number;
    totalCount: number;
    search: string;
    setSearch: (search: string) => void;
    statusFilter: RequestStatus | "all";
    setStatusFilter: (status: RequestStatus | "all") => void;
    onAction: (requestId: string, status: "accepted" | "rejected") => Promise<void>;
    processingId: string | null;
}

export function SubscriberList({
    requests,
    loading,
    page,
    setPage,
    totalPages,
    totalCount,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    onAction,
    processingId,
}: SubscriberListProps) {
    const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            {/* Header & Filters Section */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                    <Search className="h-5 w-5 shrink-0 text-neutral-400" />
                    <FormInput
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by user name or email..."
                        className="mt-0 border-0 px-0 py-0 shadow-none focus:border-transparent"
                    />
                </div>
                <FormSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as RequestStatus | "all")}
                    className="mt-0 sm:w-48"
                >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                </FormSelect>
            </div>

            {/* Table Container */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-[960px] w-full text-left border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wider text-neutral-500">
                                <th className="p-4">User</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Amount Paid</th>
                                <th className="p-4">Proof of Payment</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date Submitted</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-neutral-500">
                                        Loading subscription requests...
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-neutral-400">
                                        No subscription requests match your filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                requests.map((req) => {
                                    const profile = req.profiles;
                                    const isProcessing = processingId === req.id;

                                    return (
                                        <tr key={req.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neutral-100 font-bold text-neutral-700">
                                                        {profile?.full_name?.[0] || profile?.email?.[0] || <User className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-neutral-900">{profile?.full_name || "Unnamed User"}</p>
                                                        <p className="text-xs text-neutral-500">{profile?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center rounded-lg bg-neutral-100 px-2.5 py-1 text-xs font-bold uppercase text-neutral-700">
                                                    {req.request_type}
                                                </span>
                                            </td>
                                            <td className="p-4 font-black text-neutral-900">
                                                {req.amount_paid != null ? `$${req.amount_paid.toFixed(2)}` : "-"}
                                            </td>
                                            <td className="p-4">
                                                {req.proof_of_payment_url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedProofUrl(req.proof_of_payment_url)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                                                    >
                                                        View Receipt <ExternalLink className="h-3.5 w-3.5" />
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-neutral-400">No receipt</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                                                        req.status === "accepted" && "bg-emerald-50 text-emerald-700",
                                                        req.status === "rejected" && "bg-red-50 text-red-700",
                                                        req.status === "pending" && "bg-amber-50 text-amber-700"
                                                    )}
                                                >
                                                    {req.status === "accepted" && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                    {req.status === "rejected" && <XCircle className="h-3.5 w-3.5" />}
                                                    {req.status === "pending" && <Clock className="h-3.5 w-3.5" />}
                                                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-neutral-500">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                {req.status === "pending" ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={isProcessing}
                                                            onClick={() => onAction(req.id, "accepted")}
                                                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                                                        >
                                                            {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Accept"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isProcessing}
                                                            onClick={() => onAction(req.id, "rejected")}
                                                            className="inline-flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-medium text-neutral-400">Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls Bar */}
            <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-neutral-500">
                    Showing page <span className="font-semibold text-neutral-800">{page}</span> of <span className="font-semibold text-neutral-800">{totalPages}</span> (Total: {totalCount} requests)
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => setPage(Math.max(page - 1, 1))}
                        disabled={page <= 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setPage(Math.min(page + 1, totalPages))}
                        disabled={page >= totalPages || loading}
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>

            {/* Simple Proof Modal Preview */}
            {selectedProofUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative max-w-lg w-full rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-neutral-900 mb-4">Proof of Payment</h3>
                        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 flex items-center justify-center p-2">
                            <img
                                src={selectedProofUrl}
                                alt="Payment Proof"
                                className="max-h-[60vh] object-contain rounded-lg"
                                onError={(e) => {
                                    // Fallback if image fails or it's a non-image URL (like PDF)
                                    (e.target as HTMLElement).style.display = 'none';
                                }}
                            />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <a
                                href={selectedProofUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800"
                            >
                                Open in New Tab <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                            <button
                                type="button"
                                onClick={() => setSelectedProofUrl(null)}
                                className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}