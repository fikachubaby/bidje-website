"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export interface LegalFirm {
    id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export function useLegalView() {
    const [firms, setFirms] = useState<LegalFirm[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedFirmForEdit, setSelectedFirmForEdit] = useState<LegalFirm | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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
                toast.error(data.error || "Failed to load legal firms");
            }
        } catch (error) {
            console.error("Failed to fetch legal firms", error);
            toast.error("Failed to load legal firms");
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        fetchFirms();
    }, [fetchFirms]);

    const requestDelete = (id: string, name: string) => {
        setDeleteTarget({ id, name });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { id, name } = deleteTarget;

        try {
            const res = await fetch(`/api/admin/legals?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success(`"${name}" deleted successfully`);
                fetchFirms();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to delete firm");
            }
        } catch (error) {
            console.error("Error deleting firm:", error);
            toast.error("Failed to delete firm");
        } finally {
            setDeleteTarget(null);
        }
    };

    const cancelDelete = () => setDeleteTarget(null);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setPage(1);
    };

    const handleOpenAddModal = () => {
        setSelectedFirmForEdit(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (firm: LegalFirm) => {
        setSelectedFirmForEdit(firm);
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setSelectedFirmForEdit(null);
    };

    const handleModalSuccess = (msg: string) => {
        toast.success(msg);
        fetchFirms();
    };

    return {
        firms,
        loading,
        page,
        setPage,
        totalPages,
        totalCount,
        search,
        statusFilter,
        deleteTarget,
        isAddModalOpen,
        selectedFirmForEdit,
        handleSearchChange,
        handleStatusFilterChange,
        requestDelete,
        confirmDelete,
        cancelDelete,
        handleOpenAddModal,
        handleOpenEditModal,
        handleCloseModal,
        handleModalSuccess,
    };
}
