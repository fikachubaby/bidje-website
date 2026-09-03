"use client";

import { Edit3, Plus, Search, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import type { PropertyStatus } from "@/types/property";
import { PaginationDashboard } from "@/components/common/PaginationDashboard";
import { LegalAddModal } from "./LegalAddModal";
import { useLegalView } from "@/hooks/useLegalView";

export function LegalView() {
    const {
        firms,
        loading,
        page,
        setPage,
        totalPages,
        totalCount,
        search,
        statusFilter,
        successMessage,
        isAddModalOpen,
        selectedFirmForEdit,
        handleSearchChange,
        handleStatusFilterChange,
        handleDelete,
        handleOpenAddModal,
        handleOpenEditModal,
        handleCloseModal,
        handleModalSuccess,
    } = useLegalView();

    return (
        <div className="space-y-6">
            {successMessage && (
                <div className="toast-success">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3">
                <Button onClick={handleOpenAddModal}>
                    <Plus className="h-5 w-5 mr-1" /> Add Legal Firm
                </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="search-input-wrapper">
                    <Search className="h-5 w-5 shrink-0 text-neutral-400" />
                    <FormInput
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search legal firms by name..."
                        className="mt-0 border-0 px-0 py-0 shadow-none focus:border-transparent"
                    />
                </div>
                <FormSelect
                    value={statusFilter}
                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                    className="mt-0 sm:w-48"
                >
                    <option value="All">All statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </FormSelect>
            </div>

            <div className="admin-table-container">
                <div className="overflow-x-auto">
                    <table className="min-w-240 w-full text-left text-sm">
                        <thead className="admin-table-head">
                            <tr>
                                <th className="admin-table-th">Firm Name & Contact</th>
                                <th className="admin-table-th">Email / Phone</th>
                                <th className="admin-table-th">Status</th>
                                <th className="admin-table-th">Created At</th>
                                <th className="admin-table-th">Actions</th>
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
                                    <tr key={firm.id} className="admin-table-tr">
                                        <td className="px-5 py-4">
                                            <p className="font-bold text-neutral-900">{firm.name}</p>
                                            <p className="text-xs text-neutral-500">
                                                {firm.contact_person || "No contact person"}
                                            </p>
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
                                                    onClick={() => handleOpenEditModal(firm)}
                                                    className="admin-action-btn"
                                                    aria-label="Edit legal firm"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(firm.id, firm.name)}
                                                    className="admin-action-btn-danger"
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

            <PaginationDashboard
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalCount}
                pageSize={10}
                onPageChange={setPage}
            />

            <LegalAddModal
                isOpen={isAddModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleModalSuccess}
                editFirm={selectedFirmForEdit}
            />
        </div>
    );
}