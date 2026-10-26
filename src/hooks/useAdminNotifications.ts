"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/supabase";

export interface PendingCounts {
    propertyRequests: number;
    offers: number;
    newUsers: number;
    total: number;
}

const USERS_SEEN_KEY = "bidje:admin:usersSeenAt";
const USERS_SEEN_EVENT = "bidje:admin:users-seen";
// First visit in this browser: count registrations from the last 7 days
const DEFAULT_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000;

function getUsersSeenAt(): string {
    try {
        const stored = localStorage.getItem(USERS_SEEN_KEY);
        if (stored) return stored;
    } catch {
    }
    return new Date(Date.now() - DEFAULT_LOOKBACK_MS).toISOString();
}

/** Called when an admin opens Users & Roles, so new registrations stop counting as unseen. */
export function markUsersSeen() {
    try {
        localStorage.setItem(USERS_SEEN_KEY, new Date().toISOString());
    } catch {
    }
    window.dispatchEvent(new Event(USERS_SEEN_EVENT));
}

export function useAdminNotifications() {
    const [counts, setCounts] = useState<PendingCounts>({
        propertyRequests: 0,
        offers: 0,
        newUsers: 0,
        total: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchPendingCounts = useCallback(async () => {
        try {
            const [reqRes, offerRes, userRes] = await Promise.all([
                supabase
                    .from("property_requests")
                    .select("id", { count: "exact", head: true })
                    .eq("status", "pending"),
                supabase
                    .from("offers")
                    .select("id", { count: "exact", head: true })
                    .eq("status", "pending"),
                supabase
                    .from("profiles")
                    .select("id", { count: "exact", head: true })
                    .gt("created_at", getUsersSeenAt()),
            ]);

            const requestsCount = reqRes.count || 0;
            const offersCount = offerRes.count || 0;
            const newUsersCount = userRes.count || 0;

            setCounts({
                propertyRequests: requestsCount,
                offers: offersCount,
                newUsers: newUsersCount,
                total: requestsCount + offersCount + newUsersCount,
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
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "profiles" },
                () => fetchPendingCounts()
            )
            .subscribe();

        window.addEventListener(USERS_SEEN_EVENT, fetchPendingCounts);

        return () => {
            supabase.removeChannel(channel);
            window.removeEventListener(USERS_SEEN_EVENT, fetchPendingCounts);
        };
    }, [fetchPendingCounts]);

    return { counts, loading, refetch: fetchPendingCounts };
}