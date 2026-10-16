"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { BillingPayment, SubscriptionView } from "@/lib/subscriptions/plan";

/** Sends the browser to Fiuu's hosted payment page with the signed fields from our API. */
function postToGateway(actionUrl: string, fields: Record<string, string>) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = actionUrl;
    for (const [name, value] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
}

export function useSubscription() {
    const [subscription, setSubscription] = useState<SubscriptionView | null>(null);
    const [payments, setPayments] = useState<BillingPayment[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);

    const refresh = useCallback(async () => {
        try {
            const res = await fetch("/api/subscription");
            const data = await res.json();
            if (res.ok) {
                setSubscription(data.subscription);
                setPayments(data.payments ?? []);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const checkout = async () => {
        setBusy(true);
        try {
            const res = await fetch("/api/subscription/checkout", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Could not start payment");
            postToGateway(data.checkout.actionUrl, data.checkout.fields);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not start payment");
            setBusy(false);
        }
    };

    const setAutoRenew = async (autoRenew: boolean) => {
        setBusy(true);
        try {
            const res = await fetch("/api/subscription", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ autoRenew }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Could not update auto-renew");
            setSubscription(data.subscription);
            toast.success(autoRenew ? "Auto-renew is on" : "Auto-renew is off — access continues until the end of this period");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not update auto-renew");
        } finally {
            setBusy(false);
        }
    };

    return { subscription, payments, loading, busy, refresh, checkout, setAutoRenew };
}
