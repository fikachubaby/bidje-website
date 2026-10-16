import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { computeBidjeScore, median } from "@/lib/score/bidjeScore";

const MIN_COMPARABLES = 3;
const SCORED_STATUSES = ["Published", "Under Offer"];

interface ScoreRow {
    id: string;
    asking_price: number;
    market_value: number | null;
    area_sqft: number | null;
    monthly_rent: number | null;
    outstanding_debt: number | null;
    district: string | null;
    state: string | null;
    property_type: string | null;
    property_sentiment: {
        paid_offer_count: number;
        median_offer_ratio: number | null;
        bargain_count: number;
        fair_count: number;
        too_high_count: number;
    } | null;
}

const compKey = (r: ScoreRow) => `${r.state ?? ""}|${r.district ?? ""}|${r.property_type ?? ""}`;
const psf = (r: ScoreRow) => (r.area_sqft && r.area_sqft > 0 && r.asking_price > 0 ? r.asking_price / r.area_sqft : null);

/** Recomputes bidje_score for every live listing. */
export async function recomputeBidjeScores() {
    const { data, error } = await supabaseAdmin
        .from("properties")
        .select(
            "id, asking_price, market_value, area_sqft, monthly_rent, outstanding_debt, district, state, property_type, " +
            "property_sentiment(paid_offer_count, median_offer_ratio, bargain_count, fair_count, too_high_count)"
        )
        .in("status", SCORED_STATUSES)
        .returns<ScoreRow[]>();
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    const groups = new Map<string, { id: string; psf: number }[]>();
    for (const r of rows) {
        const v = psf(r);
        if (v == null) continue;
        const list = groups.get(compKey(r)) ?? [];
        list.push({ id: r.id, psf: v });
        groups.set(compKey(r), list);
    }

    const now = new Date().toISOString();
    let updated = 0;
    const failures: string[] = [];

    for (const r of rows) {
        const comps = (groups.get(compKey(r)) ?? []).filter((c) => c.id !== r.id).map((c) => c.psf);
        const s = r.property_sentiment;
        const { score, breakdown } = computeBidjeScore({
            askingPrice: Number(r.asking_price),
            marketValue: r.market_value != null ? Number(r.market_value) : null,
            comparablePsf: comps.length >= MIN_COMPARABLES ? median(comps) : null,
            areaSqft: r.area_sqft,
            monthlyRent: r.monthly_rent != null ? Number(r.monthly_rent) : null,
            hasEncumbrance: Number(r.outstanding_debt ?? 0) > 0,
            sentiment: s && {
                paidOfferCount: s.paid_offer_count,
                medianOfferRatio: s.median_offer_ratio != null ? Number(s.median_offer_ratio) : null,
                bargainCount: s.bargain_count,
                fairCount: s.fair_count,
                tooHighCount: s.too_high_count,
            },
        });

        const { error: updateError } = await supabaseAdmin
            .from("properties")
            .update({ bidje_score: score, bidje_score_breakdown: breakdown, bidje_score_updated_at: now })
            .eq("id", r.id);
        if (updateError) failures.push(`${r.id}: ${updateError.message}`);
        else updated++;
    }

    return { scanned: rows.length, updated, failures };
}
