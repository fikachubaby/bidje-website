"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/supabase";

export interface PendingCounts {
    propertyRequests: number;
    offers: number;
    total: number;
}

export function useAdminNotifications() {
    const [counts, setCounts] = useState<PendingCounts>({
        propertyRequests: 0,
        offers: 0,
        total: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchPendingCounts = useCallback(async () => {
        try {
            const [reqRes, offerRes] = await Promise.all([
                supabase
                    .from("property_requests")
                    .select("id", { count: "exact", head: true })
                    .eq("status", "pending"),
                supabase
                    .from("offers")
                    .select("id", { count: "exact", head: true })
                    .eq("status", "pending"),
            ]);

            const requestsCount = reqRes.count || 0;
            const offersCount = offerRes.count || 0;

            setCounts({
                propertyRequests: requestsCount,
                offers: offersCount,
                total: requestsCount + offersCount,
            });
        } catch (err) {
            console.error("Error fetching pending notification counts:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPendingCounts();

        // Subscribe to real-time database updates for instant badge changes
        const channel = supabase
            .channel("admin-notifications")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "property_requests" },
                () => fetchPendingCounts()
            )
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "offers" },
                () => fetchPendingCounts()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchPendingCounts]);

    return { counts, loading, refetch: fetchPendingCounts };
}