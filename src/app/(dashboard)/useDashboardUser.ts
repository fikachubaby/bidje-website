"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabase";

interface UseDashboardUserResult {
    loading: boolean;
    isMember: boolean;
    userId: string;
    userEmail: string;
    fullName: string;
}

/** Fetches the signed-in user's basic profile info for the dashboard header/profile card. */
export function useDashboardUser(): UseDashboardUserResult {
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [fullName, setFullName] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (cancelled) return;
                if (user) {
                    setUserId(user.id);
                    setUserEmail(user.email || "");
                    setFullName(user.user_metadata?.full_name || "Property Investor");
                }
            } catch (err) {
                console.error("Failed to load dashboard user:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    return { loading, isMember: !!userId, userId, userEmail, fullName };
}
