"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabase";
import { FormField, FormInput } from "@/components/admin/ui/FormField";

export function ResetPasswordForm() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        const { error: updateError } = await supabase.auth.updateUser({
            password,
        });

        setLoading(false);

        if (updateError) {
            setError(updateError.message || "Failed to update password. Please try again.");
            return;
        }

        // Redirect back to login upon success
        router.push("/login?confirmed=1");
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 transition-colors focus-within:border-black focus-within:bg-white">
                <FormField label="New Password" htmlFor="password" className="text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    <FormInput
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
                        className="mt-1 border-none bg-transparent p-0 shadow-none focus:ring-0 text-neutral-900"
                    />
                </FormField>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-3 transition-colors focus-within:border-black focus-within:bg-white">
                <FormField label="Confirm New Password" htmlFor="confirmPassword" className="text-xs uppercase tracking-wider text-neutral-500 font-bold">
                    <FormInput
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
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
                {loading ? "Updating..." : "Update Password"}
            </button>
        </form>
    );
}