"use client";

import { useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { formatDate } from "@/lib/investor";
import type { InvestorProperty } from "@/types/investor";
import { AiHealthBadge } from "./AiHealthBadge";

const HEALTH_RANK = { blocked: 0, at_risk: 1, on_track: 2 } as const;
const AREA_RANK = { legal: 0, renovation: 1, sales: 2, none: 3 } as const;

interface AiMonitorPanelProps {
    properties: InvestorProperty[];
    onRunAll: () => Promise<void>;
    onOpen: (id: string) => void;
}

/** Portfolio-level view of the AI blocker analysis: blocked first, legal first. */
export function AiMonitorPanel({ properties, onRunAll, onOpen }: AiMonitorPanelProps) {
    const [running, setRunning] = useState(false);

    const flagged = useMemo(
        () =>
            properties
                .filter((p) => p.aiAnalysis && p.aiAnalysis.health !== "on_track")
                .sort(
                    (a, b) =>
                        HEALTH_RANK[a.aiAnalysis!.health] - HEALTH_RANK[b.aiAnalysis!.health] ||
                        AREA_RANK[a.aiAnalysis!.stuck_area] - AREA_RANK[b.aiAnalysis!.stuck_area] ||
                        b.aiAnalysis!.days_stalled - a.aiAnalysis!.days_stalled
                ),
        [properties]
    );
    const checked = properties.filter((p) => p.aiAnalysis).length;
    const lastRun = properties.reduce<string | null>(
        (max, p) => (p.aiAnalyzedAt && (!max || p.aiAnalyzedAt > max) ? p.aiAnalyzedAt : max),
        null
    );

    const run = async () => {
        setRunning(true);
        try {
            await onRunAll();
        } finally {
            setRunning(false);
        }
    };

    return (
        <section className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-sm font-black">
                        <Sparkles className="h-4 w-4 text-amber-500" /> AI Progress Monitor
                    </h3>
                    <p className="text-xs text-neutral-500">
                        {checked
                            ? `${checked} of ${properties.length} checked · last run ${formatDate(lastRun)} · ${flagged.length} need attention`
                            : "Let AI read each property's checklist and updates to find what's blocking it."}
                    </p>
                </div>
                <Button variant="secondary" size="sm" onClick={run} disabled={running || !properties.length}>
                    {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {running ? "Checking..." : "Run AI check"}
                </Button>
            </div>

            {flagged.length > 0 && (
                <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                    {flagged.map((p) => (
                        <li key={p.id}>
                            <button
                                type="button"
                                onClick={() => onOpen(p.id)}
                                className="w-full rounded-xl border border-neutral-100 p-3 text-left hover:border-neutral-300"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-bold">{p.address}</p>
                                    <AiHealthBadge analysis={p.aiAnalysis} />
                                </div>
                                <p className="mt-1 text-xs text-neutral-700">{p.aiAnalysis!.blocker}</p>
                                <p className="mt-1 text-xs text-neutral-500">
                                    <b>Next:</b> {p.aiAnalysis!.next_action} · waiting on {p.aiAnalysis!.waiting_on.replace("_", " ")} ·{" "}
                                    {p.aiAnalysis!.days_stalled}d without progress
                                </p>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
