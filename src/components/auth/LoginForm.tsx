"use client";

import { FormEvent, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/supabase";
import { FormField, FormInput } from "@/components/admin/ui/FormField";
import { submitOfferToSupabase } from "@/lib/offers/submitOffer";
import { clearPendingOffer } from "@/lib/offers/pendingOffer";

export function VisitorLoginForm() {
    const searchParams = useSearchParams();
    const justConfirmed = searchParams.get("confirmed") === "1";
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const rawStorage = sessionStorage.getItem("bidje:pendingOffer");
        if (rawStorage) {
            try {
                const parsed = JSON.parse(rawStorage);
                if (parsed.email) setEmail(parsed.email);
            } catch {
            }
        }
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError || !authData.user) {
            setLoading(false);
            setError("Incorrect email or password. Please try again.");
            return;
        }

        const rawPending = sessionStorage.getItem("bidje:pendingOffer");
        if (rawPending) {
            try {
                const pendingData = JSON.parse(rawPending);
                if (pendingData.propertyId) {
                    await submitOfferToSupabase({
                        propertyId: pendingData.propertyId,
                        userId: authData.user.id,
                        data: pendingData,
                    });
                    clearPendingOffer();
                }
            } catch {
            }
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single();

        setLoading(false);

        const isAdminOrStaff = profile?.role === "admin" || profile?.role === "staff";
        const redirectPath = isAdminOrStaff ? "/admin" : rawPending ? "/dashboard" : searchParams.get("next") || "/";

        window.location.href = redirectPath;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {justConfirmed ? (
                <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    Email confirmed — you can sign in now.
                </p>
            ) : null}

            {/* Email Field Segment */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 transition-colors focus-within:border-black focus-within:bg-white">
                <FormField label="Email" htmlFor="email" className="text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    <FormInput
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        placeholder="name@example.com"
                        className="mt-1 border-none bg-transparent p-0 shadow-none focus:ring-0 text-neutral-900"
                    />
                </FormField>
            </div>

            {/* Password Field Segment */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 transition-colors focus-within:border-black focus-within:bg-white">
                <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-xs uppercase tracking-wider text-neutral-500 font-bold">
                        Password
                    </label>
                    <Link
                        href="/forgot-password"
                        className="text-xs font-bold text-neutral-600 underline decoration-[#ffd400] decoration-2 underline-offset-2 transition-colors hover:text-black"
                    >
                        Forgot password?
                    </Link>
                </div>
                <FormInput
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="mt-1 border-none bg-transparent p-0 shadow-none focus:ring-0 text-neutral-900 w-full"
                />
            </div>

            {error ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </p>
            ) : null}

            {/* Stable Button */}
            <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl border-2 border-[#ffd400] bg-[#ffd400] px-4 py-3 text-sm font-black text-black transition-colors hover:bg-[#ffe24b] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? "Signing in…" : "Sign in"}
            </button>
        </form>
    );
}

export { VisitorLoginForm as LoginForm };