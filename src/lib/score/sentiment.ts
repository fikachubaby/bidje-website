import type { PropertySentiment } from "@/types/property";
import { SENTIMENT_MIN_RESPONSES } from "@/lib/score/bidjeScore";

export type Opinion = "bargain" | "fair" | "too_high";

export const OPINION_LABELS: Record<Opinion, string> = {
    bargain: "Bargain",
    fair: "Fair price",
    too_high: "Too high",
};

export function opinionTotal(s?: PropertySentiment) {
    return s ? s.bargainCount + s.fairCount + s.tooHighCount : 0;
}

/** One-line summary, e.g. "12 buyers · median offer 94% of asking". Null when there's nothing to say. */
export function summariseSentiment(s?: PropertySentiment): string | null {
    if (!s) return null;
    const responses = opinionTotal(s) + s.paidOfferCount;
    if (responses === 0) return null;

    const parts = [`${responses} buyer${responses === 1 ? "" : "s"}`];
    if (s.paidOfferCount > 0 && s.medianOfferRatio != null) {
        parts.push(`median offer ${Math.round(s.medianOfferRatio * 100)}% of asking`);
    } else if (opinionTotal(s) > 0) {
        const top = (Object.keys(OPINION_LABELS) as Opinion[]).reduce((a, b) =>
            countFor(s, b) > countFor(s, a) ? b : a
        );
        parts.push(`most say "${OPINION_LABELS[top]}"`);
    }
    return parts.join(" · ");
}

export function hasEnoughSentiment(s?: PropertySentiment) {
    return opinionTotal(s) + (s?.paidOfferCount ?? 0) >= SENTIMENT_MIN_RESPONSES;
}

export function countFor(s: PropertySentiment, o: Opinion) {
    return o === "bargain" ? s.bargainCount : o === "fair" ? s.fairCount : s.tooHighCount;
}
