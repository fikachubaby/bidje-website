"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { FormInput } from "@/components/admin/ui/FormField";
import { Button } from "@/components/ui/ButtonProps";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingAlerts, setSavingAlerts] = useState(false);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [auctionAlertsOptedIn, setAuctionAlertsOptedIn] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch("/api/profile").then((res) => res.json()),
            fetch("/api/auction-alerts/subscription").then((res) => res.json()),
        ])
            .then(([profileData, subscriptionData]) => {
                const profile = profileData?.profile;
                setFullName(profile?.full_name ?? "");
                setPhone(profile?.phone ?? "");
                setEmail(profile?.email ?? "");
                setAuctionAlertsOptedIn(subscriptionData?.subscription?.opted_in === true);
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

    const updateAuctionAlertConsent = async (optedIn: boolean) => {
        setSavingAlerts(true);
        try {
            const res = await fetch("/api/auction-alerts/subscription", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ optedIn }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update auction alert preference");
            setAuctionAlertsOptedIn(data.subscription?.opted_in === true);
            toast.success(optedIn ? "WhatsApp auction alerts enabled" : "WhatsApp auction alerts disabled");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update auction alert preference");
        } finally {
            setSavingAlerts(false);
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
                    WhatsApp reminders and auction alerts are sent to this number when enabled.
                </p>
                <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                        {saving ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </form>

            <section className="mt-5 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="font-bold text-neutral-900">WhatsApp auction alerts</h2>
                        <p className="mt-1 text-sm text-neutral-600">
                            Receive BIDJE auction-property alerts on WhatsApp when a listing matches the active alert criteria.
                        </p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={auctionAlertsOptedIn}
                        disabled={savingAlerts}
                        onClick={() => updateAuctionAlertConsent(!auctionAlertsOptedIn)}
                        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                            auctionAlertsOptedIn ? "bg-emerald-600" : "bg-neutral-300"
                        } ${savingAlerts ? "cursor-wait opacity-60" : "cursor-pointer"}`}
                    >
                        <span
                            className={`inline-block h-5 w-5 rounded-full bg-white shadow transition ${
                                auctionAlertsOptedIn ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                    </button>
                </div>

                <label className="mt-4 flex items-start gap-3 rounded-xl bg-neutral-50 p-4 text-xs leading-5 text-neutral-600">
                    <input
                        type="checkbox"
                        checked={auctionAlertsOptedIn}
                        disabled={savingAlerts}
                        onChange={(e) => updateAuctionAlertConsent(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-neutral-300"
                    />
                    <span>
                        I agree to receive BIDJE auction property alerts via WhatsApp at the mobile number saved in my profile. I can turn these alerts off at any time from this page.
                    </span>
                </label>
            </section>
        </div>
    );
}
