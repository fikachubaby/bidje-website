"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Reminder, ReminderFormInput } from "@/types/reminder";
import { toastDeliveryResults } from "@/lib/reminders";

export function useReminders() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReminders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/reminders");
            const data = await res.json();
            setReminders(data.reminders ?? []);
        } catch (err) {
            console.error("Failed to fetch reminders:", err);
            toast.error("Failed to load reminders");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReminders();
    }, [fetchReminders]);

    const createReminder = async (input: ReminderFormInput) => {
        try {
            const res = await fetch("/api/reminders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(input),
            });
            if (!res.ok) throw new Error("Failed to create reminder");
            const data = await res.json();
            await fetchReminders();
            toast.success("Reminder created successfully");
            await toastDeliveryResults(data.results);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create reminder");
            throw err;
        }
    };

    const deleteReminder = async (id: string) => {
        try {
            const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete reminder");
            setReminders((prev) => prev.filter((r) => r.id !== id));
            toast.success("Reminder deleted");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to delete reminder");
        }
    };

    const cancelReminder = async (id: string) => {
        try {
            const res = await fetch(`/api/reminders/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "cancelled" }),
            });
            if (!res.ok) throw new Error("Failed to cancel reminder");
            await fetchReminders();
            toast.success("Reminder cancelled");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to cancel reminder");
        }
    };

    const sendNow = async (id: string) => {
        try {
            const res = await fetch(`/api/reminders/${id}/send-now`, { method: "POST" });
            const data = await res.json().catch(() => ({}));
            if (!data.results) throw new Error(data.error || "Failed to send reminder");
            await toastDeliveryResults(data.results);
            await fetchReminders();
            return data;
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to send reminder");
            throw err;
        }
    };

    return { reminders, loading, fetchReminders, createReminder, deleteReminder, cancelReminder, sendNow };
}
