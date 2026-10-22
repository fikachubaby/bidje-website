"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/supabase";
import { ProfileSection } from "./_components/ProfileSection";
import { AccountSection } from "./_components/AccountSection";
import { WishlistSection } from "./_components/WishlistSection";

const SECTIONS = [
    { id: "profile", label: "Profile" },
    { id: "password", label: "Password" },
    { id: "account", label: "Account" },
    { id: "wishlist", label: "Wishlist" },
];

export default function SettingsPage() {
    const [user, setUser] = useState<{ email: string; createdAt: string | null } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUser({ email: data.user.email ?? "", createdAt: data.user.created_at ?? null });
            setLoading(false);
        });
    }, []);

    // Sections render after the user loads, so jump to #wishlist etc. once they exist.
    useEffect(() => {
        if (!loading && window.location.hash) {
            document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth" });
        }
    }, [loading]);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center">
                <p className="font-bold">Sign in to manage your settings.</p>
                <a href="/login?next=/settings" className="mt-4 inline-block text-sm font-bold underline">
                    Sign in
                </a>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-12">
            <div>
                <h1 className="text-3xl font-black tracking-tight">Settings</h1>
                <p className="mt-1 text-sm text-neutral-500">Your profile, account and saved properties.</p>
            </div>

            <nav className="flex gap-2 overflow-x-auto">
                {SECTIONS.map((s) => (
                    <a
                        key={s.id}
                        href={`#${s.id}`}
                        className="shrink-0 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-bold text-neutral-600 hover:border-black hover:text-black"
                    >
                        {s.label}
                    </a>
                ))}
            </nav>

            <ProfileSection />
            <AccountSection email={user.email} createdAt={user.createdAt} />
            <WishlistSection />
        </div>
    );
}
