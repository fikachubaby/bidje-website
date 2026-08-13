import { ScoreBadge, ScoreBreakdown } from "@/types/score";

export function getScoreBadge(val: number): ScoreBadge {
    if (val >= 85) {
        return {
            label: "Unicorn Deal 🔥",
            color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
            desc: "Extreme Below Market Value or exceptional yield with low legal risk.",
        };
    }
    if (val >= 70) {
        return {
            label: "Strong Investment 💎",
            color: "text-blue-400 border-blue-500/40 bg-blue-500/10",
            desc: "Solid discount or yield potential. Recommended for investors.",
        };
    }
    if (val >= 50) {
        return {
            label: "Fair Market Deal ⚖️",
            color: "text-amber-400 border-amber-500/40 bg-amber-500/10",
            desc: "Priced around market rate. Better suited for long-term home buyers.",
        };
    }
    return {
        label: "Higher Risk / Overpriced ⚠️",
        color: "text-rose-400 border-rose-500/40 bg-rose-500/10",
        desc: "Requires heavy price negotiation or careful legal due diligence.",
    };
}

export function calculateLocalScoreFallback(
    marketValue: number,
    askingPrice: number,
    monthlyRent: number,
    hasEncumbrance: boolean
): { score: number; breakdown: ScoreBreakdown } {
    const bmvPercent = Math.max(0, ((marketValue - askingPrice) / marketValue) * 100);
    const grossYield = askingPrice > 0 ? ((monthlyRent * 12) / askingPrice) * 100 : 0;

    const calculatedBmv = Math.min(Math.max((bmvPercent / 30) * 35, 0), 35);
    const calculatedYield = Math.min(Math.max((grossYield / 7) * 30, 0), 30);
    const calculatedLegal = hasEncumbrance ? 5 : 20;
    const calculatedDemand = 10;

    const finalScore = Math.min(
        Math.max(Math.round(calculatedBmv + calculatedYield + calculatedLegal + calculatedDemand), 15),
        99
    );

    return {
        score: finalScore,
        breakdown: {
            bmvScore: Number(calculatedBmv.toFixed(1)),
            yieldScore: Number(calculatedYield.toFixed(1)),
            legalScore: calculatedLegal,
            demandScore: calculatedDemand,
        },
    };
}