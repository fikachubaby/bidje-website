"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { User, Lock, CheckCircle2, AlertCircle, Loader2, ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        async function loadUserProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setEmail(user.email || "");
                setFullName(user.user_metadata?.full_name || "");
                setPhone(user.user_metadata?.phone || "");
            }
            setLoading(false);
        }
        loadUserProfile();
    }, [supabase]);

    async function handleUpdateProfile(e: FormEvent) {
        e.preventDefault();
        setSavingProfile(true);
        setProfileMessage(null);

        const { error } = await supabase.auth.updateUser({
            data: { full_name: fullName, phone },
        });

        if (error) {
            setProfileMessage({ type: "error", text: error.message });
        } else {
            setProfileMessage({ type: "success", text: "Profile details updated successfully!" });
        }
        setSavingProfile(false);
    }

    async function handleUpdatePassword(e: FormEvent) {
        e.preventDefault();
        setPasswordMessage(null);

        if (password !== confirmPassword) {
            setPasswordMessage({ type: "error", text: "New passwords do not match." });
            return;
        }

        if (password.length < 6) {
            setPasswordMessage({ type: "error", text: "Password must be at least 6 characters long." });
            return;
        }

        setSavingPassword(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setPasswordMessage({ type: "error", text: error.message });
        } else {
            setPasswordMessage({ type: "success", text: "Password updated successfully!" });
            setPassword("");
            setConfirmPassword("");
        }
        setSavingPassword(false);
    }

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-8 pb-12">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-neutral-500">
                <Link href="/dashboard" className="flex items-center gap-1.5 transition-colors hover:text-black">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                </Link>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
                <span className="font-medium text-black">User Profile</span>
            </nav>

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-black">User Profile & Settings</h1>
                <p className="mt-1 text-sm text-neutral-500">Manage your personal account details and security settings.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Profile Details Card */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                        <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                            <User className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-black">Personal Information</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
                        {profileMessage && (
                            <div className={`flex items-center gap-2 rounded-2xl p-4 text-sm ${profileMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                                {profileMessage.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                <span>{profileMessage.text}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">Email Address (Read-only)</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="mt-1.5 w-full rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your full name"
                                className="mt-1.5 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Enter your phone number"
                                className="mt-1.5 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-3.5 text-sm font-bold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                        >
                            {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Change Password Card */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                        <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                            <Lock className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-black">Change Password</h2>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4">
                        {passwordMessage && (
                            <div className={`flex items-center gap-2 rounded-2xl p-4 text-sm ${passwordMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                                {passwordMessage.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                                <span>{passwordMessage.text}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 6 characters"
                                className="mt-1.5 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="mt-1.5 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={savingPassword}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-bold text-black transition-colors hover:bg-neutral-50 disabled:opacity-50"
                            >
                                {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}