"use client";

import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/supabase";

/**
 * One shared wishlist store for the whole page, so a grid of property cards
 * makes a single auth listener and a single wishlist query.
 */
interface WishlistState {
    user: User | null;
    ids: Set<string>;
    ready: boolean;
}

let state: WishlistState = { user: null, ids: new Set(), ready: false };
const listeners = new Set<() => void>();
let initialised = false;

function setState(next: Partial<WishlistState>) {
    state = { ...state, ...next };
    listeners.forEach((l) => l());
}

async function loadFor(user: User | null) {
    if (!user) {
        setState({ user: null, ids: new Set(), ready: true });
        return;
    }
    const { data, error } = await supabase.from("wishlists").select("property_id").eq("user_id", user.id);
    if (error) console.error("Failed to load wishlist:", error.message);
    setState({ user, ids: new Set((data ?? []).map((r) => r.property_id as string)), ready: true });
}

function init() {
    if (initialised) return;
    initialised = true;
    supabase.auth.onAuthStateChange((_event, session) => {
        const user = session?.user ?? null;
        if (user?.id !== state.user?.id || !state.ready) void loadFor(user);
    });
}

function subscribe(listener: () => void) {
    init();
    listeners.add(listener);
    return () => listeners.delete(listener);
}

const getSnapshot = () => state;

export function isEmailVerified(user: User | null) {
    return Boolean(user?.email_confirmed_at);
}

async function toggle(propertyId: string) {
    const { user, ids } = state;

    if (!user) {
        toast("Sign in to save properties to your wishlist", {
            action: {
                label: "Sign in",
                onClick: () => {
                    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
                },
            },
        });
        return;
    }
    if (!isEmailVerified(user)) {
        toast.error("Please verify your email to use your wishlist");
        return;
    }

    const saved = ids.has(propertyId);
    const next = new Set(ids);
    if (saved) next.delete(propertyId);
    else next.add(propertyId);
    setState({ ids: next }); // optimistic

    const { error } = saved
        ? await supabase.from("wishlists").delete().eq("user_id", user.id).eq("property_id", propertyId)
        : await supabase.from("wishlists").insert({ user_id: user.id, property_id: propertyId });

    if (error) {
        setState({ ids }); // roll back
        toast.error("Couldn't update your wishlist. Please try again.");
        return;
    }
    toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
}

export function useWishlist() {
    const { user, ids, ready } = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return {
        user,
        ready,
        ids,
        isSaved: (propertyId: string) => ids.has(propertyId),
        toggle,
    };
}
