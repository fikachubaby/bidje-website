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
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name Field Segment */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 transition-colors focus-within:border-black focus-within:bg-white">
                <FormField label="Full name" htmlFor="fullName" className="text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    <FormInput
                        id="fullName"
                        name="fullName"
                        required
                        autoComplete="name"
                        placeholder="John Doe"
                        className="mt-1 border-none bg-transparent p-0 shadow-none focus:ring-0 text-neutral-900 text-base sm:text-sm"
                    />
                </FormField>
            </div>

            {/* Phone Number Field Segment */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 transition-colors focus-within:border-black focus-within:bg-white">
                <FormField label="Phone number" htmlFor="phone" className="text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    <FormInput
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        autoComplete="tel"
                        placeholder="e.g. 0137098606"
                        className="mt-1 border-none bg-transparent p-0 shadow-none focus:ring-0 text-neutral-900 text-base sm:text-sm"
                    />
                </FormField>
            </div>

            {/* Email Field Segment */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 transition-colors focus-within:border-black focus-within:bg-white">
                <FormField label="Email" htmlFor="email" className="text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    <FormInput
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="name@example.com"
                        className="mt-1 border-none bg-transparent p-0 shadow-none focus:ring-0 text-neutral-900 text-base sm:text-sm"
                    />
                </FormField>
            </div>

            {/* Password Field Segment */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 transition-colors focus-within:border-black focus-within:bg-white">
                <FormField label="Password" htmlFor="password" className="text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    <FormInput
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        className="mt-1 border-none bg-transparent p-0 shadow-none focus:ring-0 text-neutral-900 text-base sm:text-sm"
                    />
                </FormField>
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
                {loading ? "Creating account…" : "Create account"}
            </button>
        </form>
    );
}