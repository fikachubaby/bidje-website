"use client";

import { useEffect, useState } from "react";
import { KeyRound, Loader2, MessageCircle, UserRound } from "lucide-react";
import { toast } from "sonner";
import { FormInput } from "@/components/admin/ui/FormField";
import { Button } from "@/components/ui/ButtonProps";
import { supabase } from "@/lib/supabase/supabase";

/** Name, email and phone, plus a password change form. */
export function ProfileSection() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        fetch("/api/profile")
            .then((res) => res.json())
            .then(({ profile }) => {
                setFullName(profile?.full_name ?? "");
                setPhone(profile?.phone ?? "");
                setEmail(profile?.email ?? "");
            })
            .finally(() => setLoading(false));
    }, []);

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, phone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save profile");
            if (data.phone) setPhone(data.phone);
            toast.success("Profile updated");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save profile");
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) return toast.error("Password must be at least 8 characters");
        if (password !== confirm) return toast.error("Passwords don't match");
        setChangingPassword(true);
        const { error } = await supabase.auth.updateUser({ password });
        setChangingPassword(false);
        if (error) return toast.error(error.message);
        setPassword("");
        setConfirm("");
        toast.success("Password changed");
    };

    if (loading) {
        return (
            <div className="flex justify-center rounded-2xl border border-neutral-200 bg-white py-10">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            <form id="profile" onSubmit={save} className="scroll-mt-28 space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                    <UserRound className="h-5 w-5" /> User profile
                </h2>
                <FormInput label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <FormInput label="Email" value={email} disabled hint="Contact Bidje to change your login email." />
                <FormInput
                    label="Mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="012-345 6789"
                    inputMode="tel"
                />
                <p className="-mt-3 flex items-center gap-1.5 text-xs text-neutral-500">
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                    WhatsApp reminders about your properties are sent to this number.
                </p>
                <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </form>

            <form id="password" onSubmit={changePassword} className="scroll-mt-28 space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                    <KeyRound className="h-5 w-5" /> Change password
                </h2>
                <FormInput
                    label="New password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    hint="At least 8 characters."
                    required
                />
                <FormInput
                    label="Confirm new password"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                    required
                />
                <div className="flex justify-end">
                    <Button type="submit" disabled={changingPassword}>
                        {changingPassword ? "Updating..." : "Update password"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
