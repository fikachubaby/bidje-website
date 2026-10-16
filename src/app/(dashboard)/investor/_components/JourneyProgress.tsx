"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryProgress } from "@/lib/investor";
import type { InvestorProperty, MilestoneCategory } from "@/types/investor";

export const JOURNEY: { key: MilestoneCategory; label: string; icon: string }[] = [
    { key: "legal", label: "Legal", icon: "⚖️" },
    { key: "renovation", label: "Renovation", icon: "🛠️" },
    { key: "sales", label: "Sales", icon: "🏷️" },
];

/** Grows from 0 on first render so progress feels alive. */
function useAnimatedWidth(value: number) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const t = requestAnimationFrame(() => setWidth(value));
        return () => cancelAnimationFrame(t);
    }, [value]);
    return width;
}

function Segment({
    property,
    step,
    active,
    compact,
    onSelect,
}: {
    property: InvestorProperty;
    step: (typeof JOURNEY)[number];
    active?: boolean;
    compact?: boolean;
    onSelect?: (key: MilestoneCategory) => void;
}) {
    const items = property.milestones.filter((m) => m.category === step.key);
    const done = items.filter((m) => m.done).length;
    const pct = categoryProgress(property.milestones, step.key);
    const next = items.find((m) => !m.done);
    const width = useAnimatedWidth(pct);
    const complete = pct === 100;

    const tooltip = complete ? "All steps completed" : next ? `Next: ${next.label}` : "Not started";

    return (
        <button
            type="button"
            disabled={!onSelect}
            onClick={(e) => {
                e.stopPropagation();
                onSelect?.(step.key);
            }}
            title={`${step.label}: ${done}/${items.length} steps · ${tooltip}`}
            className={cn(
                "group relative flex-1 text-left",
                onSelect && "cursor-pointer",
                !compact && "rounded-xl p-2 transition-colors hover:bg-neutral-50",
                active && !compact && "bg-brand-muted/50"
            )}
        >
            {!compact && (
                <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1.5">
                        <span aria-hidden>{step.icon}</span>
                        {step.label}
                    </span>
                    {complete ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                        <span className="text-neutral-500">{pct}%</span>
                    )}
                </div>
            )}
            <div className={cn("overflow-hidden rounded-full bg-neutral-100", compact ? "h-1.5" : "h-2.5")}>
                <div
                    className={cn(
                        "h-full rounded-full transition-[width] duration-700 ease-out",
                        complete ? "bg-emerald-500" : "bg-brand group-hover:bg-brand-dark"
                    )}
                    style={{ width: `${width}%` }}
                />
            </div>
            {!compact && <p className="mt-1.5 truncate text-[11px] text-neutral-500">{tooltip}</p>}
        </button>
    );
}

/** Legal → Renovation → Sales, each segment clickable to open that checklist. */
export function JourneyProgress({
    property,
    activeKey,
    compact,
    onSelect,
}: {
    property: InvestorProperty;
    activeKey?: string;
    compact?: boolean;
    onSelect?: (key: MilestoneCategory) => void;
}) {
    return (
        <div className={cn("flex", compact ? "gap-1" : "gap-2")}>
            {JOURNEY.map((step) => (
                <Segment
                    key={step.key}
                    property={property}
                    step={step}
                    active={activeKey === step.key}
                    compact={compact}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
