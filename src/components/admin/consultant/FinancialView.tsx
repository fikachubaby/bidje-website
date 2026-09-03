"use client";

import type { ComponentProps } from "react";
import { Edit3, Plus, Search, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { PaginationDashboard } from "@/components/common/PaginationDashboard";
import { FinancialAddModal } from "./FinancialAddModal";
import { useFinancialView } from "@/hooks/useFinancialView";

type BadgeStatusType = ComponentProps<typeof StatusBadge>["status"];

export function FinancialView() {
    const {
        consultants,
        loading,
        page,
        setPage,
        totalPages,
        totalCount,
        search,
        statusFilter,
        successMessage,
        isAddModalOpen,
        selectedConsultantForEdit,
        handleSearchChange,
        handleStatusFilterChange,
        handleDelete,
        handleOpenAddModal,
        handleOpenEditModal,
        handleCloseModal,
        handleModalSuccess,
    } = useFinancialView();

    return (
        <div className="space-y-6">
            {/* Toast Notification Banner */}
            {successMessage && (
                <div className="toast-success">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3">
                <Button onClick={handleOpenAddModal}>
                    <Plus className="h-5 w-5 mr-1" /> Add Financing Consultant
                </Button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="search-input-wrapper">
                    <Search className="h-5 w-5 shrink-0 text-neutral-400" />
                    <FormInput
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search consultants by name..."
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
                    <table className="min-w-3xl w-full text-left text-sm">
                        <thead className="admin-table-head">
                            <tr>
                                <th className="admin-table-th">Consultant Name</th>
                                <th className="admin-table-th">Status</th>
                                <th className="admin-table-th">Created At</th>
                                <th className="admin-table-th">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-12 text-center text-neutral-500">
                                        Loading consultants from database...
                                    </td>
                                </tr>
                            ) : consultants.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-12 text-center text-neutral-500">
                                        No financing consultants match your filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                consultants.map((consultant) => (
                                    <tr key={consultant.id} className="admin-table-tr">
                                        <td className="px-5 py-4 font-bold text-neutral-900">
                                            {consultant.name}
                                        </td>
                                        <td className="px-5 py-4">
                                            <StatusBadge
                                                status={(consultant.is_active ? "Active" : "Inactive") as BadgeStatusType}
                                            />
                                        </td>
                                        <td className="px-5 py-4 text-neutral-600">
                                            {new Date(consultant.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEditModal(consultant)}
                                                    className="admin-action-btn"
                                                    aria-label="Edit consultant"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(consultant.id, consultant.name)}
                                                    className="admin-action-btn-danger"
                                                    aria-label="Delete consultant"
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

            <FinancialAddModal
                isOpen={isAddModalOpen}
                onClose={handleCloseModal}
                onSuccess={handleModalSuccess}
                editConsultant={selectedConsultantForEdit}
            />
        </div>
    );
}