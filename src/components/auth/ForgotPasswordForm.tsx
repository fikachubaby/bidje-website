"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { FormField, FormInput } from "@/components/admin/ui/FormField";

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        // Dynamic redirect URL based on current origin
        const redirectTo = `${window.location.origin}/reset-password`;

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        setLoading(false);

        if (resetError) {
            setError(resetError.message || "Failed to send reset link. Please try again.");
            return;
        }

        setSuccess(true);
    }

    if (success) {
        return (
            <div className="rounded-xl bg-green-50 p-4 text-sm font-medium text-green-800 space-y-1">
                <p className="font-bold">Check your email!</p>
                <p className="text-green-700">
                    We sent a password reset link to <span className="font-semibold">{email}</span>.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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

            {error ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </p>
            ) : null}

            <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl border-2 border-[#ffd400] bg-[#ffd400] px-4 py-3 text-sm font-black text-black transition-colors hover:bg-[#ffe24b] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? "Sending link…" : "Send Reset Link"}
            </button>
        </form>
    );
}