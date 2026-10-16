import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { addMonths, SUBSCRIBER_PLAN, type SubscriptionView } from "./plan";

export async function getSubscriptionRow(userId: string) {
    const { data } = await supabaseAdmin.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
    return data;
}

export function toView(row: Awaited<ReturnType<typeof getSubscriptionRow>>): SubscriptionView {
    return {
        status: row?.status ?? "none",
        planName: SUBSCRIBER_PLAN.name,
        price: Number(row?.price ?? SUBSCRIBER_PLAN.price),
        currentPeriodEnd: row?.expires_at ?? null,
        autoRenew: Boolean(row?.auto_renew),
        cancelAtPeriodEnd: Boolean(row?.cancel_at_period_end),
        cardLabel: row?.card_label ?? null,
        hasSavedCard: Boolean(row?.payment_token),
    };
}

/**
 * Records a successful subscription payment: starts a new period or extends the current one
 * (renewing early never loses paid days), and makes sure the user has the subscriber role.
 */
export async function activateOrExtend(userId: string, opts: { paymentToken?: string | null; cardLabel?: string | null } = {}) {
    const existing = await getSubscriptionRow(userId);
    const now = new Date();
    const currentEnd = existing?.expires_at ? new Date(existing.expires_at) : null;
    const periodStart = currentEnd && currentEnd > now ? currentEnd : now;
    const periodEnd = addMonths(periodStart, SUBSCRIBER_PLAN.intervalMonths);

    const row = {
        user_id: userId,
        status: "active",
        plan: SUBSCRIBER_PLAN.code,
        price: SUBSCRIBER_PLAN.price,
        started_at: existing?.started_at ?? now.toISOString(),
        current_period_start: periodStart.toISOString(),
        expires_at: periodEnd.toISOString(),
        auto_renew: existing?.auto_renew ?? true,
        cancel_at_period_end: false,
        renewal_failures: 0,
        next_retry_at: null,
        updated_at: now.toISOString(),
        ...(opts.paymentToken ? { payment_token: opts.paymentToken, card_label: opts.cardLabel ?? existing?.card_label ?? null } : {}),
    };

    const { error } = await supabaseAdmin.from("subscriptions").upsert(row, { onConflict: "user_id" });
    if (error) throw new Error(error.message);

    // Staff/admin/investor keep their own role; everyone else becomes a subscriber.
    await supabaseAdmin.from("profiles").update({ role: "subscriber" }).eq("id", userId).in("role", ["visitor", "subscriber"]);
    return periodEnd;
}
