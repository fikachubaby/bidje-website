"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { ImportRow } from "@/lib/investor";
import type {
    InvestorProperty,
    InvestorPropertyInput,
    InvestorSummary,
    UpdateCategory,
} from "@/types/investor";

async function request(url: string, init?: RequestInit) {
    const res = await fetch(url, {
        ...init,
        headers: { "Content-Type": "application/json", ...init?.headers },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
}

export function useInvestors() {
    const [investors, setInvestors] = useState<InvestorSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInvestors = useCallback(async () => {
        setLoading(true);
        try {
            const data = await request("/api/admin/investors");
            setInvestors(data.investors ?? []);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load investors");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvestors();
    }, [fetchInvestors]);

    const promoteToInvestor = async (investorId: string) => {
        await request("/api/admin/investors", { method: "PATCH", body: JSON.stringify({ investorId }) });
        toast.success("User is now an investor");
        await fetchInvestors();
    };

    return { investors, loading, refresh: fetchInvestors, promoteToInvestor };
}

export function useInvestorProperties(investorId: string | null) {
    const [properties, setProperties] = useState<InvestorProperty[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchProperties = useCallback(async () => {
        if (!investorId) {
            setProperties([]);
            return;
        }
        setLoading(true);
        try {
            const data = await request(`/api/admin/investor-properties?investorId=${investorId}`);
            setProperties(data.properties ?? []);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load properties");
        } finally {
            setLoading(false);
        }
    }, [investorId]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    const withRefresh = async (fn: () => Promise<unknown>, success?: string) => {
        try {
            await fn();
            if (success) toast.success(success);
            await fetchProperties();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Something went wrong");
            throw err;
        }
    };

    return {
        properties,
        loading,
        refresh: fetchProperties,
        createProperty: (input: InvestorPropertyInput) =>
            withRefresh(
                () => request("/api/admin/investor-properties", { method: "POST", body: JSON.stringify(input) }),
                "Property added"
            ),
        importRows: (rows: ImportRow[]) =>
            withRefresh(
                () =>
                    request("/api/admin/investor-properties", {
                        method: "POST",
                        body: JSON.stringify({ investorId, rows }),
                    }),
                `Imported ${rows.length} properties`
            ),
        updateProperty: (id: string, input: Partial<InvestorPropertyInput>) =>
            withRefresh(
                () => request(`/api/admin/investor-properties/${id}`, { method: "PATCH", body: JSON.stringify(input) }),
                "Property saved"
            ),
        deleteProperty: (id: string) =>
            withRefresh(
                () => request(`/api/admin/investor-properties/${id}`, { method: "DELETE" }),
                "Property removed"
            ),
        toggleMilestone: (id: string, milestoneId: string, done: boolean) =>
            withRefresh(() =>
                request(`/api/admin/investor-properties/${id}/milestones/${milestoneId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ done }),
                })
            ),
        sendReminder: async (reminderId: string) => {
            const data = await request(`/api/reminders/${reminderId}/send-now`, { method: "POST" }).catch((err) => {
                toast.error(err instanceof Error ? err.message : "Failed to send reminder");
                throw err;
            });
            const failed = data.results?.filter((r: { ok: boolean }) => !r.ok) ?? [];
            if (failed.length) toast.error(`Sent, but ${failed.length} channel(s) failed`);
            else toast.success("Reminder sent");
            await fetchProperties();
        },
        cancelReminder: (reminderId: string) =>
            withRefresh(
                () => request(`/api/reminders/${reminderId}`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) }),
                "Reminder cancelled"
            ),
        deleteReminder: (reminderId: string) =>
            withRefresh(() => request(`/api/reminders/${reminderId}`, { method: "DELETE" }), "Reminder deleted"),
        addUpdate: (id: string, category: UpdateCategory, message: string, visibleToInvestor: boolean) =>
            withRefresh(
                () =>
                    request(`/api/admin/investor-properties/${id}/updates`, {
                        method: "POST",
                        body: JSON.stringify({ category, message, visibleToInvestor }),
                    }),
                "Update posted"
            ),
    };
}
