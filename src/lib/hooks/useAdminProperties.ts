"use client";

import { useState, useCallback, useEffect } from "react";
import type { AdminProperty, AdminPropertyInput, PropertyStatus } from "@/types/property";

export function useAdminProperties(isAuthenticated: boolean) {
    const [properties, setProperties] = useState<AdminProperty[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProperties = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/properties");
            const data = await res.json();
            if (res.ok) setProperties(data.properties || []);
        } catch (err) {
            console.error("Error loading properties:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) fetchProperties();
    }, [isAuthenticated, fetchProperties]);

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
        fetchProperties,
        saveProperty,
        deleteProperty,
        updateStatus,
        duplicateProperty,
    };
}