"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/supabase";
import type { User } from "@supabase/supabase-js";
import { Lock, User as UserIcon, CheckCircle2 } from "lucide-react";

interface ProfileViewProps {
    user: User;
}

export function ProfileView({ user }: ProfileViewProps) {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        setLoading(true);
        setMessage("");

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            alert("Error updating password: " + error.message);
        } else {
            setMessage("Password successfully updated!");
            setPassword("");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-black text-neutral-900">Account Credentials</h2>
                <p className="text-xs text-neutral-500 mb-6">Update your sign-in password details below.</p>

                {message && (
                    <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {message}
                    </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                            Email Address (Read-only)
                        </label>
                        <input
                            type="email"
                            disabled
                            value={user.email || ""}
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 h-4 w-4 text-neutral-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full rounded-xl border border-neutral-200 bg-white pl-11 pr-4 py-3 text-sm font-medium text-neutral-900 focus:border-neutral-900 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-neutral-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}