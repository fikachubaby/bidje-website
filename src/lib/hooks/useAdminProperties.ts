"use client";

import { useState, useCallback, useEffect } from "react";
import type { 
    AdminProperty,
    AdminPropertyInput,
    PropertyStatus,
    OfferStatus,
    BuyerOffer,
} from "@/types/property";
import { buildQueryString } from "@/lib/utils";

export function useAdminProperties(isAuthenticated: boolean) {
    const [properties, setProperties] = useState<AdminProperty[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<PropertyStatus | "All">("All");

    const fetchProperties = useCallback(async () => {
        try {
            setLoading(true);
            const queryString = buildQueryString({
                page,
                limit,
                search,
                status: statusFilter,
            });

            const res = await fetch(`/api/admin/properties?${queryString}`);
            const data = await res.json();

            if (res.ok) {
                setProperties(data.properties || []);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                    setTotalCount(data.pagination.totalCount);
                }
            }
        } catch (err) {
            console.error("Error loading properties:", err);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search, statusFilter]);

    useEffect(() => {
        if (isAuthenticated) fetchProperties();
    }, [isAuthenticated, fetchProperties]);

    const handleSearchChange = (term: string) => {
        setSearch(term);
        setPage(1);
    };

    const handleStatusFilterChange = (status: PropertyStatus | "All") => {
        setStatusFilter(status);
        setPage(1);
    };

    const saveProperty = useCallback(
        async (input: AdminPropertyInput, editingId?: string) => {
            const endpoint = editingId
                ? `/api/admin/properties/${editingId}`
                : "/api/admin/properties";
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });

            if (!res.ok) throw new Error("Failed to save property");
            await fetchProperties();
        },
        [fetchProperties]
    );

    const deleteProperty = useCallback(
        async (id: string) => {
            if (!window.confirm("Delete this property listing? This cannot be undone.")) return;
            const res = await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete property");
            await fetchProperties();
        },
        [fetchProperties]
    );

    const updateStatus = useCallback(
        async (id: string, status: PropertyStatus) => {
            const res = await fetch(`/api/admin/properties/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            await fetchProperties();
        },
        [fetchProperties]
    );

    const duplicateProperty = useCallback(
        async (property: AdminProperty) => {
            const duplicateInput: AdminPropertyInput = {
                name: `${property.name} (Copy)`,
                price: property.price,
                address: property.address,
                state: property.state,
                district: property.district,
                propertyType: property.propertyType,
                tenure: property.tenure,
                bumiStatus: property.bumiStatus,
                landSize: property.landSize,
                builtUp: property.builtUp,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                description: property.description,
                mapsUrl: property.mapsUrl,
                images: property.images || [],
                status: "Draft" as PropertyStatus,
                outstandingDebt: property.outstandingDebt,
                minimumPrice: property.minimumPrice,
                internalNotes: property.internalNotes || "",
                isAddressHidden: property.isAddressHidden || false,
                documents: property.documents || [],
                furnishing: property.furnishing || "Unfurnished",
                tags: property.tags || [],
            };

            const res = await fetch("/api/admin/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(duplicateInput),
            });

            if (!res.ok) throw new Error("Failed to duplicate property");
            await fetchProperties();
        },
        [fetchProperties]
    );

    return {
        properties,
        loading,
        page,
        setPage,
        totalPages,
        totalCount,
        search,
        setSearch: handleSearchChange,
        statusFilter,
        setStatusFilter: handleStatusFilterChange,
        fetchProperties,
        saveProperty,
        deleteProperty,
        updateStatus,
        duplicateProperty,
    };
}

export function useAdminOffers(isAuthenticated: boolean) {
    const [offers, setOffers] = useState<BuyerOffer[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchOffers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/offers");
            const data = await res.json();
            if (res.ok) setOffers(data.offers || []);
        } catch (err) {
            console.error("Error loading offers:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) fetchOffers();
    }, [isAuthenticated, fetchOffers]);

    const updateOfferStatus = useCallback(
        async (id: string, status: OfferStatus) => {
            const res = await fetch(`/api/admin/offers/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error("Failed to update offer status");
            await fetchOffers();
        },
        [fetchOffers]
    );

    return { offers, loading, fetchOffers, updateOfferStatus };
}