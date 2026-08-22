"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/supabase";
import { Profile, SUBSCRIBER_ROLES } from "@/types/user";

export function useSession() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (!error && data) {
            setProfile(data as Profile);
        } else {
            setProfile(null);
        }
    };

    useEffect(() => {
        const initializeSession = async () => {
            const { data } = await supabase.auth.getSession();
            const currentUser = data.session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser.id);
            }
            setLoading(false);
        };

        initializeSession();

        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    const isSubscriber = Boolean(profile && SUBSCRIBER_ROLES.includes(profile.role));

    return { user, profile, isSubscriber, loading };
}