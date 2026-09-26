"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Send, Trash2, XCircle } from "lucide-react";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Button } from "@/components/ui/ButtonProps";
import { PaginationDashboard } from "@/components/common/PaginationDashboard";
import { useReminders } from "@/hooks/useReminders";
import { formatDueIn } from "@/lib/reminders";
import { AddReminderModal } from "./AddReminderModal";
import type { ReminderOfferOption, ReminderPropertyOption, ReminderStatus } from "@/types/reminder";

interface ReminderListProps {
    properties: ReminderPropertyOption[];
    offers?: ReminderOfferOption[];
}

export function ReminderList({ properties, offers = [] }: ReminderListProps) {
    const { reminders, loading, createReminder, deleteReminder, cancelReminder, sendNow } = useReminders();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<ReminderStatus | "All">("All");
    const [showAddModal, setShowAddModal] = useState(false);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [confirmTarget, setConfirmTarget] = useState<{ id: string; action: "delete" | "cancel" } | null>(null);

    const filtered = reminders.filter((r) => {
        const matchesSearch =
            !search ||
            r.title.toLowerCase().includes(search.toLowerCase()) ||
            r.propertyTitle?.toLowerCase().includes(search.toLowerCase()) ||
            r.investorName?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    // Guard against a stale currentPage when filters/deletes shrink the result set
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (value: ReminderStatus | "All") => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleSendNow = async (id: string) => {
        setSendingId(id);
        try {
            await sendNow(id);
        } finally {
            setSendingId(null);
        }
    };

    const handleConfirm = async () => {
        if (!confirmTarget) return;
        if (confirmTarget.action === "delete") {
            await deleteReminder(confirmTarget.id);
        } else {
            await cancelReminder(confirmTarget.id);
        }
        setConfirmTarget(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-end gap-3">
                <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="mr-1 h-5 w-5" />
                    Add Reminder
                </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="search-input-wrapper">
                    <Search className="h-5 w-5 shrink-0 text-neutral-400" />
                    <FormInput
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by title, property, or investor..."
                        className="mt-0 border-0 px-0 py-0 shadow-none focus:border-transparent"
                    />
                </div>
                <FormSelect
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value as ReminderStatus | "All")}
                    className="mt-0 sm:w-48"
                >
                    <option value="All">All statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="sent">Sent</option>
                    <option value="cancelled">Cancelled</option>
                </FormSelect>
            </div>

            <div className="admin-table-container">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-sm">
                        <thead className="admin-table-head">
                            <tr>
                                <th className="admin-table-th">Reminder</th>
                                <th className="admin-table-th">Property / Investor</th>
                                <th className="admin-table-th">Due</th>
                                <th className="admin-table-th">Status</th>
                                <th className="admin-table-th">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-neutral-500">
                                        Loading reminders...
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-neutral-500">
                                        No reminders match your filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((r) => (
                                    <tr key={r.id} className="admin-table-tr transition-colors hover:bg-neutral-50/50">
                                        <td className="px-5 py-4">
                                            <p className="font-bold text-neutral-900">{r.title}</p>
                                            <p className="mt-0.5 dashboard-subtext text-xs uppercase">{r.channel}</p>
                                        </td>
                                        <td className="px-5 py-4 text-neutral-600">
                                            <p className="font-semibold text-neutral-900">{r.propertyTitle ?? "—"}</p>
                                            <p className="mt-0.5 text-xs text-neutral-400">{r.investorName ?? r.investorEmail}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-neutral-900">
                                                {new Date(r.dueDate).toLocaleDateString("en-GB")}
                                            </p>
                                            <p className="mt-0.5 text-xs text-neutral-400">{formatDueIn(r.dueDate)}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={r.status} />
                                            {r.lastSentAt && (
                                                <p className="mt-1 text-[11px] text-neutral-400">
                                                    Last sent {new Date(r.lastSentAt).toLocaleDateString("en-GB")}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSendNow(r.id)}
                                                    disabled={sendingId === r.id || r.status === "cancelled"}
                                                    className="admin-action-btn"
                                                    aria-label="Send now"
                                                    title="Send now"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </button>
                                                {r.status !== "cancelled" && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setConfirmTarget({ id: r.id, action: "cancel" })}
                                                        className="admin-action-btn"
                                                        aria-label="Cancel reminder"
                                                        title="Cancel"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmTarget({ id: r.id, action: "delete" })}
                                                    className="admin-action-btn-danger"
                                                    aria-label="Delete reminder"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <PaginationDashboard
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                }}
            />

            {showAddModal && (
                <AddReminderModal
                    properties={properties}
                    offers={offers}
                    onClose={() => setShowAddModal(false)}
                    onSubmit={createReminder}
                />
            )}

            <ConfirmDialog
                open={confirmTarget !== null}
                title={confirmTarget?.action === "delete" ? "Delete this reminder?" : "Cancel this reminder?"}
                description={
                    confirmTarget?.action === "delete"
                        ? "This will permanently remove the reminder. This action cannot be undone."
                        : "This will stop future notifications for this reminder, but keep it in your history."
                }
                confirmLabel={confirmTarget?.action === "delete" ? "Delete" : "Cancel Reminder"}
                danger={confirmTarget?.action === "delete"}
                onConfirm={handleConfirm}
                onCancel={() => setConfirmTarget(null)}
            />
        </div>
    );
}
