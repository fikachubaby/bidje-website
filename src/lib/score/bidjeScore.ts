/**
 * Bidje Score: how good a deal a property is, out of 100.
 *
 * Four pillars (same weights as the score simulator):
 *   BMV / capital upside   35  — discount to market value, or to comparable price per sq ft
 *   Rental yield           30  — gross yield, 7%+ scores full marks
 *   Legal risk             20  — encumbrance (outstanding debt) costs points
 *   Demand                 15  — buyer sentiment, once enough buyers have responded
 *
 * A pillar without data scores half marks and is flagged `estimated`, so a
 * sparse listing lands mid-table instead of looking great or terrible.
 */

export const SENTIMENT_MIN_RESPONSES = 5;

const MIN_SCORE = 15;
const MAX_SCORE = 99;

export interface SentimentInput {
    paidOfferCount: number;
    medianOfferRatio: number | null; // median paid offer / asking price
    bargainCount: number;
    fairCount: number;
    tooHighCount: number;
}

export interface BidjeScoreInput {
    askingPrice: number;
    /** Valuer's market value, if known. */
    marketValue?: number | null;
    /** Fallback reference: median price per sq ft of comparable listings. */
    comparablePsf?: number | null;
    areaSqft?: number | null;
    monthlyRent?: number | null;
    hasEncumbrance: boolean;
    sentiment?: SentimentInput | null;
}

export interface BidjeScoreBreakdown {
    bmvScore: number;
    yieldScore: number;
    legalScore: number;
    demandScore: number;
    bmvPercent: number | null;
    grossYield: number | null;
    /** Pillars that fell back to half marks for lack of data. */
    estimated: ("bmv" | "yield" | "demand")[];
}

export interface BidjeScoreResult {
    score: number;
    breakdown: BidjeScoreBreakdown;
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const round1 = (v: number) => Number(v.toFixed(1));

function referenceValue(input: BidjeScoreInput): number | null {
    if (input.marketValue && input.marketValue > 0) return input.marketValue;
    if (input.comparablePsf && input.areaSqft && input.areaSqft > 0) return input.comparablePsf * input.areaSqft;
    return null;
}

/** 0–1 demand signal from opinions and paid offers, or null below the response threshold. */
export function demandSignal(s: SentimentInput | null | undefined): number | null {
    if (!s) return null;
    const opinions = s.bargainCount + s.fairCount + s.tooHighCount;
    if (opinions + s.paidOfferCount < SENTIMENT_MIN_RESPONSES) return null;

    const parts: number[] = [];
    if (opinions > 0) {
        // -1 (all "too high") .. +1 (all "bargain"), mapped to 0..1
        parts.push(((s.bargainCount - s.tooHighCount) / opinions + 1) / 2);
    }
    if (s.paidOfferCount > 0 && s.medianOfferRatio != null) {
        // Offers at 85% of asking or below score 0; at asking or above score 1.
        parts.push(clamp((s.medianOfferRatio - 0.85) / 0.15, 0, 1));
    }
    return parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : null;
}

export function computeBidjeScore(input: BidjeScoreInput): BidjeScoreResult {
    const estimated: BidjeScoreBreakdown["estimated"] = [];

    const ref = referenceValue(input);
    let bmvPercent: number | null = null;
    let bmvScore: number;
    if (ref && input.askingPrice > 0) {
        bmvPercent = Math.max(0, ((ref - input.askingPrice) / ref) * 100);
        bmvScore = clamp((bmvPercent / 30) * 35, 0, 35);
    } else {
        bmvScore = 35 / 2;
        estimated.push("bmv");
    }

    let grossYield: number | null = null;
    let yieldScore: number;
    if (input.monthlyRent && input.monthlyRent > 0 && input.askingPrice > 0) {
        grossYield = ((input.monthlyRent * 12) / input.askingPrice) * 100;
        yieldScore = clamp((grossYield / 7) * 30, 0, 30);
    } else {
        yieldScore = 30 / 2;
        estimated.push("yield");
    }

    const legalScore = input.hasEncumbrance ? 5 : 20;

    const signal = demandSignal(input.sentiment);
    let demandScore: number;
    if (signal != null) {
        demandScore = signal * 15;
    } else {
        demandScore = 15 / 2;
        estimated.push("demand");
    }

    const score = clamp(Math.round(bmvScore + yieldScore + legalScore + demandScore), MIN_SCORE, MAX_SCORE);

    return {
        score,
        breakdown: {
            bmvScore: round1(bmvScore),
            yieldScore: round1(yieldScore),
            legalScore,
            demandScore: round1(demandScore),
            bmvPercent: bmvPercent == null ? null : Math.round(bmvPercent),
            grossYield: grossYield == null ? null : round1(grossYield),
            estimated,
        },
    };
}

export function median(values: number[]): number | null {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
