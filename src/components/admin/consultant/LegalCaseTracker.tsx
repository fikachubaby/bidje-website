"use client";

import { useState } from "react";
import { AlertTriangle, Clock, Building2, User } from "lucide-react";
import { useLegalCaseTracker } from "@/hooks/useLegalCaseTracker";
import { STAGE_CATEGORY_ORDER, STAGE_CATEGORY_LABELS } from "@/types/legal-case";
import type { LegalCaseStage, LegalStageCategory } from "@/types/legal-case";

function daysSince(dateStr?: string | null): number | null {
    if (!dateStr) return null;
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function isOverdue(stage: LegalCaseStage): boolean {
    if (!stage.expectedBy) return false;
    return new Date(stage.expectedBy).getTime() < Date.now();
}

export function LegalCaseTracker() {
    const { stages, loading, moveStage, markBlocked, unblock } = useLegalCaseTracker();
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [blockingId, setBlockingId] = useState<string | null>(null);
    const [blockReason, setBlockReason] = useState("");

    const stagesByCategory = STAGE_CATEGORY_ORDER.reduce<Record<string, LegalCaseStage[]>>((acc, cat) => {
        acc[cat] = stages.filter((s) => s.stageCategory === cat);
        return acc;
    }, {});

    const handleDrop = (targetCategory: LegalStageCategory) => {
        if (!draggedId) return;
        const dragged = stages.find((s) => s.id === draggedId);
        if (!dragged) return;

        const currentIndex = STAGE_CATEGORY_ORDER.indexOf(dragged.stageCategory);
        const targetIndex = STAGE_CATEGORY_ORDER.indexOf(targetCategory);

        // Only allow dropping into the immediate next column — enforces the legal sequence
        if (targetIndex === currentIndex + 1) {
            moveStage(draggedId, targetCategory, true);
        }
        setDraggedId(null);
    };

    const submitBlock = () => {
        if (blockingId && blockReason.trim()) {
            markBlocked(blockingId, blockReason.trim());
            setBlockingId(null);
            setBlockReason("");
        }
    };

    if (loading) {
        return <p className="py-12 text-center text-sm text-neutral-500">Loading legal cases...</p>;
    }

    if (stages.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-neutral-500">
                No active legal cases yet. Cases are created automatically when an offer is accepted.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
                {STAGE_CATEGORY_ORDER.map((category, colIndex) => (
                    <div
                        key={category}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(category)}
                        className="w-72 shrink-0 rounded-2xl bg-neutral-50 border border-neutral-200"
                    >
                        <div className="px-4 py-3 border-b border-neutral-200">
                            <p className="font-bold text-sm text-neutral-900">{STAGE_CATEGORY_LABELS[category]}</p>
                            <p className="text-xs text-neutral-400">{stagesByCategory[category]?.length ?? 0} case(s)</p>
                        </div>

                        <div className="p-3 space-y-3 min-h-30">
                            {(stagesByCategory[category] ?? []).map((stage) => {
                                const overdue = isOverdue(stage);
                                const days = daysSince(stage.startedAt);

                                return (
                                    <div
                                        key={stage.id}
                                        draggable={STAGE_CATEGORY_ORDER.indexOf(category) === colIndex}
                                        onDragStart={() => setDraggedId(stage.id)}
                                        className={`rounded-xl border bg-white p-3 shadow-sm cursor-grab active:cursor-grabbing ${stage.status === "blocked"
                                                ? "border-red-300 bg-red-50"
                                                : overdue
                                                    ? "border-amber-300"
                                                    : "border-neutral-200"
                                            }`}
                                    >
                                        <p className="font-semibold text-sm text-neutral-900 truncate">
                                            {stage.propertyTitle ?? "Untitled property"}
                                        </p>
                                        <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                                            <User className="h-3 w-3" /> {stage.buyerName ?? "—"}
                                        </p>
                                        {stage.legalFirmName && (
                                            <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                                                <Building2 className="h-3 w-3" /> {stage.legalFirmName}
                                            </p>
                                        )}
                                        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-neutral-400">
                                            <Clock className="h-3 w-3" />
                                            {days !== null ? `${days}d in stage` : "Not started"}
                                            {overdue && <span className="ml-1 font-bold text-amber-600">· overdue</span>}
                                        </p>

                                        {stage.status === "blocked" ? (
                                            <div className="mt-2 rounded-lg bg-red-100 px-2 py-1.5">
                                                <p className="flex items-center gap-1 text-[11px] font-bold text-red-700">
                                                    <AlertTriangle className="h-3 w-3" /> Blocked
                                                </p>
                                                <p className="mt-0.5 text-[11px] text-red-600">{stage.blockedReason}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => unblock(stage.id)}
                                                    className="mt-1 text-[11px] font-bold text-blue-600 hover:underline"
                                                >
                                                    Mark unblocked
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setBlockingId(stage.id)}
                                                className="mt-2 text-[11px] font-bold text-red-600 hover:underline"
                                            >
                                                Flag as blocked
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {blockingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-neutral-900">Flag this case as blocked</h3>
                        <textarea
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            placeholder="e.g. Waiting on client's signed consent letter"
                            rows={3}
                            className="mt-3 w-full rounded-xl border border-neutral-300 p-3 text-sm focus:border-black focus:outline-none"
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setBlockingId(null)}
                                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-bold text-neutral-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submitBlock}
                                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
                            >
                                Confirm Blocked
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
