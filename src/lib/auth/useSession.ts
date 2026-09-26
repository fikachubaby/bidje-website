"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/supabase";
import { Profile, SUBSCRIBER_ROLES } from "@/types/user";

export function useSession() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async (userId: string) => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (isMounted) {
                setProfile(!error && data ? (data as Profile) : null);
            }
        };

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;

            if (isMounted) {
                setUser(currentUser);
            }

            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else if (isMounted) {
                setProfile(null);
            }

            if (isMounted) {
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    const isSubscriber = Boolean(profile && SUBSCRIBER_ROLES.includes(profile.role));

    return { user, profile, isSubscriber, loading };
}
