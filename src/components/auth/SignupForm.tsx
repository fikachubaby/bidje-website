"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabase";
import { FormField, FormInput } from "@/components/admin/ui/FormField";

export function SignupForm() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setLoading(true);

        const data = new FormData(event.currentTarget);
        const fullName = String(data.get("fullName") ?? "").trim();
        const phone = String(data.get("phone") ?? "").trim();
        const email = String(data.get("email") ?? "").trim();
        const password = String(data.get("password") ?? "");

        if (!fullName || !phone || !email || !password) {
            setError("All fields are required.");
            setLoading(false);
            return;
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            setLoading(false);
            return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName, phone },
            },
        });

        setLoading(false);

        if (signUpError) {
            setError(signUpError.message);
            return;
        }

        router.push("/signup/check-email");
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Full name" htmlFor="fullName">
                <FormInput id="fullName" name="fullName" required autoComplete="name" />
            </FormField>

            <FormField label="Phone number" htmlFor="phone">
                <FormInput
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="e.g. 0137098606"
                />
            </FormField>

            <FormField label="Email" htmlFor="email">
                <FormInput id="email" name="email" type="email" required autoComplete="email" />
            </FormField>

            <FormField label="Password" htmlFor="password">
                <FormInput
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="new-password"
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
                {loading ? "Creating account…" : "Create account"}
            </button>
        </form>
    );
}