"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { LegalCaseStage } from "@/types/legal-case";

export function useLegalCaseTracker() {
    const [stages, setStages] = useState<LegalCaseStage[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/legal-cases");
            const data = await res.json();
            setStages(data.stages ?? []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load legal cases");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStages();
    }, [fetchStages]);

    const moveStage = async (stageId: string, newCategory: string, markStarted = false) => {
        // Optimistic update
        setStages((prev) => prev.map((s) => (s.id === stageId ? { ...s, status: "completed" } : s)));

        try {
            const res = await fetch(`/api/legal-cases/${stageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "completed", markStarted }),
            });
            if (!res.ok) throw new Error("Failed to move stage");
            toast.success("Stage marked complete — next stage started");
            await fetchStages();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to update stage");
            await fetchStages(); // revert optimistic update
        }
    };

    const markBlocked = async (stageId: string, reason: string) => {
        try {
            const res = await fetch(`/api/legal-cases/${stageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "blocked", blockedReason: reason }),
            });
            if (!res.ok) throw new Error("Failed to flag blocker");
            toast.success("Case flagged as blocked");
            await fetchStages();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to flag blocker");
        }
    };

    const unblock = async (stageId: string) => {
        try {
            const res = await fetch(`/api/legal-cases/${stageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "in_progress", blockedReason: null }),
            });
            if (!res.ok) throw new Error("Failed to unblock");
            toast.success("Case unblocked");
            await fetchStages();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to unblock");
        }
    };

    const regenerateSummary = async (stageId: string) => {
        try {
            const res = await fetch(`/api/legal-cases/${stageId}/summarize`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to generate summary");
            toast.success("AI summary generated");
            await fetchStages();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to generate summary");
        }
    };

    return { stages, loading, fetchStages, moveStage, markBlocked, unblock, regenerateSummary };
}
