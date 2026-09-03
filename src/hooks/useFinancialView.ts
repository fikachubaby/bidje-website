import { useState, useEffect, useCallback } from "react";

export interface FinancingConsultant {
    id: string;
    name: string;
    is_active: boolean;
    created_at: string;
}

export function useFinancialView() {
    const [consultants, setConsultants] = useState<FinancingConsultant[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedConsultantForEdit, setSelectedConsultantForEdit] =
        useState<FinancingConsultant | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setSuccessMessage(message);
    };

    useEffect(() => {
        if (!successMessage) return;
        const timer = setTimeout(() => {
            setSuccessMessage(null);
        }, 4000);
        return () => clearTimeout(timer);
    }, [successMessage]);

    const fetchConsultants = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                search,
                status: statusFilter,
            });

            const res = await fetch(`/api/admin/financings?${params.toString()}`);
            const data = await res.json();

            if (res.ok) {
                setConsultants(data.consultants || []);
                setTotalCount(data.totalCount || 0);
                setTotalPages(data.totalPages || 1);
            } else {
                console.error("Failed to load consultants:", data.error);
            }
        } catch (error) {
            console.error("Failed to fetch financing consultants", error);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        fetchConsultants();
    }, [fetchConsultants]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const res = await fetch(`/api/admin/financings?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                showToast("Financing consultant deleted successfully!");
                fetchConsultants();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete consultant");
            }
        } catch (error) {
            console.error("Error deleting consultant:", error);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setPage(1);
    };

    const handleOpenAddModal = () => {
        setSelectedConsultantForEdit(null);
        setIsAddModalOpen(true);
    };

    const handleOpenEditModal = (consultant: FinancingConsultant) => {
        setSelectedConsultantForEdit(consultant);
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setSelectedConsultantForEdit(null);
    };

    const handleModalSuccess = (msg: string) => {
        showToast(msg);
        fetchConsultants();
    };

    return {
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
    };
}