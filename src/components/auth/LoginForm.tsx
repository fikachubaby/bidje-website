"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/supabase";
import { FormField, FormInput } from "@/components/admin/ui/FormField";

export function VisitorLoginForm() {
    const searchParams = useSearchParams();
    const justConfirmed = searchParams.get("confirmed") === "1";
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        const data = new FormData(event.currentTarget);
        const email = String(data.get("email") ?? "").trim();
        const password = String(data.get("password") ?? "");

        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError || !authData.user) {
            setLoading(false);
            setError("Incorrect email or password. Please try again.");
            return;
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .single();

        setLoading(false);

        const isAdminOrStaff = profile?.role === "admin" || profile?.role === "staff";
        const redirectPath = isAdminOrStaff ? "/admin" : "/";

        window.location.href = redirectPath;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {justConfirmed ? (
                <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                    Email confirmed — you can sign in now.
                </p>
            ) : null}

            <FormField label="Email" htmlFor="email">
                <FormInput id="email" name="email" type="email" required autoComplete="email" />
            </FormField>

            <FormField label="Password" htmlFor="password">
                <FormInput
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                />
            </FormField>

            {error ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </p>
            ) : null}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl border-2 border-[#ffd400] bg-[#ffd400] px-4 py-3 text-sm font-black text-black transition hover:bg-[#ffe24b] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? "Signing in…" : "Sign in"}
            </button>
        </form>
    );
}

export { VisitorLoginForm as LoginForm };