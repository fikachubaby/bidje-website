"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { FormInput } from "@/components/admin/ui/FormField";
import { Button } from "@/components/ui/ButtonProps";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

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

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-lg pb-12">
            <h1 className="text-3xl font-black tracking-tight">My Profile</h1>
            <p className="mt-1 text-sm text-neutral-500">Keep your details up to date so we can reach you.</p>

            <form onSubmit={save} className="mt-6 space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
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
        </div>
    );
}
