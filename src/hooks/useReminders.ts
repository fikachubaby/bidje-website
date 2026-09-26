"use client";

import { useCallback, useEffect, useState } from "react";
import type { Reminder, ReminderFormInput } from "@/types/reminder";

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
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReminders();
    }, [fetchReminders]);

    const createReminder = async (input: ReminderFormInput) => {
        const res = await fetch("/api/reminders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });
        if (!res.ok) throw new Error("Failed to create reminder");
        await fetchReminders();
    };

    const deleteReminder = async (id: string) => {
        const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete reminder");
        setReminders((prev) => prev.filter((r) => r.id !== id));
    };

    const cancelReminder = async (id: string) => {
        const res = await fetch(`/api/reminders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "cancelled" }),
        });
        if (!res.ok) throw new Error("Failed to cancel reminder");
        await fetchReminders();
    };

    const sendNow = async (id: string) => {
        const res = await fetch(`/api/reminders/${id}/send-now`, { method: "POST" });
        if (!res.ok) throw new Error("Failed to send reminder");
        await fetchReminders();
        return res.json();
    };

    return { reminders, loading, fetchReminders, createReminder, deleteReminder, cancelReminder, sendNow };
}