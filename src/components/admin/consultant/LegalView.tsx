"use client";

import { useState, useEffect, useCallback } from "react";
import { Edit3, Plus, Search, Trash2, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { LegalAddModal } from "./LegalAddModal";
import type { PropertyStatus } from "@/types/property";

interface LegalFirm {
    id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export function LegalView() {
    const [firms, setFirms] = useState<LegalFirm[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedFirmForEdit, setSelectedFirmForEdit] = useState<LegalFirm | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setSuccessMessage(message);
    };

    // Auto-dismiss toast after 4 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const fetchFirms = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                search,
                status: statusFilter,
            });

            const res = await fetch(`/api/admin/legals?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setFirms(data.firms || []);
                setTotalCount(data.totalCount || 0);
                setTotalPages(data.totalPages || 1);
            } else {
                console.error("Failed to load firms:", data.error);
            }
        } catch (error) {
            console.error("Failed to fetch legal firms", error);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        fetchFirms();
    }, [fetchFirms]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const res = await fetch(`/api/admin/legals?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                showToast("Legal firm deleted successfully!");
                fetchFirms();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete firm");
            }
        } catch (error) {
            console.error("Error deleting firm:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Success Toast Notification Banner */}
            {successMessage && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 border border-emerald-200 shadow-sm transition-all">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-black text-neutral-900">Legal Management</h2>
                    <p className="text-sm text-neutral-500">Manage registered law firms and legal consultants.</p>
                </div>
                <Button onClick={() => { setSelectedFirmForEdit(null); setIsAddModalOpen(true); }}>
                    <Plus className="h-5 w-5 mr-1" /> Add Legal Firm
                </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                    <Search className="h-5 w-5 shrink-0 text-neutral-400" />
                    <FormInput
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search legal firms by name..."
                        className="mt-0 border-0 px-0 py-0 shadow-none focus:border-transparent"
                    />
                </div>
                <FormSelect
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                    }}
                    className="mt-0 sm:w-48"
                >
                    <option value="All">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </FormSelect>
            </div>

            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-[960px] w-full text-left text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50">
                            <tr>
                                <th className="px-5 py-4 font-bold text-neutral-600">Firm Name & Contact</th>
                                <th className="px-5 py-4 font-bold text-neutral-600">Email / Phone</th>
                                <th className="px-5 py-4 font-bold text-neutral-600">Status</th>
                                <th className="px-5 py-4 font-bold text-neutral-600">Created At</th>
                                <th className="px-5 py-4 font-bold text-neutral-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-neutral-500">
                                        Loading legal firms from database...
                                    </td>
                                </tr>
                            ) : firms.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-neutral-500">
                                        No legal firms match your filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                firms.map((firm) => (
                                    <tr key={firm.id} className="border-b border-neutral-100 last:border-0">
                                        <td className="px-5 py-4">
                                            <p className="font-bold text-neutral-900">{firm.name}</p>
                                            <p className="text-xs text-neutral-500">{firm.contact_person || "No contact person"}</p>
                                        </td>
                                        <td className="px-5 py-4 text-neutral-600">
                                            <p>{firm.email || "-"}</p>
                                            <p className="text-xs text-neutral-400">{firm.phone || "-"}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge status={(firm.is_active ? "Active" : "Inactive") as PropertyStatus} />
                                        </td>
                                        <td className="px-5 py-4 text-neutral-600">
                                            {new Date(firm.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFirmForEdit(firm);
                                                        setIsAddModalOpen(true);
                                                    }}
                                                    className="rounded-lg border border-neutral-200 p-2 hover:bg-neutral-50"
                                                    aria-label="Edit legal firm"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(firm.id, firm.name)}
                                                    className="rounded-lg border border-neutral-200 p-2 hover:bg-red-50 hover:text-red-600"
                                                    aria-label="Delete legal firm"
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

            <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-neutral-500">
                    Showing page <span className="font-semibold text-neutral-800">{page}</span> of{" "}
                    <span className="font-semibold text-neutral-800">{totalPages}</span> (Total: {totalCount} firms)
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

            <LegalAddModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setSelectedFirmForEdit(null);
                }}
                onSuccess={(msg) => {
                    showToast(msg);
                    fetchFirms();
                }}
                editFirm={selectedFirmForEdit}
            />
        </div>
    );
}