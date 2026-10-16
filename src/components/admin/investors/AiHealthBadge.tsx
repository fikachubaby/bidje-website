import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InvestorAiAnalysis } from "@/types/investor";

export const AI_HEALTH = {
    blocked: { label: "Blocked", className: "bg-red-50 text-red-700 border-red-200" },
    at_risk: { label: "At risk", className: "bg-amber-50 text-amber-700 border-amber-200" },
    on_track: { label: "On track", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
} as const;

export function AiHealthBadge({ analysis }: { analysis?: InvestorAiAnalysis | null }) {
    if (!analysis) return null;
    const h = AI_HEALTH[analysis.health];
    return (
        <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black", h.className)}>
            <Sparkles className="h-3 w-3" />
            {h.label}
            {analysis.stuck_area !== "none" && ` · ${analysis.stuck_area}`}
        </span>
    );
}
