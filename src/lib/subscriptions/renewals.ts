import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { chargeFiuuToken, toOrderId } from "@/lib/payments/fiuu";
import { RENEWAL_GRACE_DAYS, SUBSCRIBER_PLAN } from "./plan";

const DAY = 86400000;
const MAX_RETRIES = 3;

/** A renewal charge failed: keep access during the grace period and retry daily, then expire. */
export async function markRenewalFailed(userId: string) {
    const { data: sub } = await supabaseAdmin.from("subscriptions").select("*").eq("user_id", userId).maybeSingle();
    if (!sub) return;

    const failures = (sub.renewal_failures ?? 0) + 1;
    const graceEnds = new Date(new Date(sub.expires_at).getTime() + RENEWAL_GRACE_DAYS * DAY);
    const giveUp = failures >= MAX_RETRIES || Date.now() > graceEnds.getTime();

    await supabaseAdmin
        .from("subscriptions")
        .update({
            status: giveUp ? "expired" : "past_due",
            renewal_failures: failures,
            next_retry_at: giveUp ? null : new Date(Date.now() + DAY).toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

    if (giveUp) await revokeSubscriberRole(userId);
}

async function revokeSubscriberRole(userId: string) {
    // Only plain subscribers lose access; staff/admin/investor roles are untouched.
    await supabaseAdmin.from("profiles").update({ role: "visitor" }).eq("id", userId).eq("role", "subscriber");
}

/** Charges one subscription's saved card. The result is confirmed later by the Fiuu callback. */
async function chargeRenewal(sub: { user_id: string; payment_token: string; price: number }) {
    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", sub.user_id)
        .single();

    const { data: payment, error } = await supabaseAdmin
        .from("payments")
        .insert({
            user_id: sub.user_id,
            type: "subscription",
            amount: Number(sub.price ?? SUBSCRIBER_PLAN.price),
            status: "pending",
            gateway: "fiuu",
            channel: "auto-renew",
        })
        .select("id")
        .single();
    if (error) throw new Error(error.message);

    const result = await chargeFiuuToken({
        token: sub.payment_token,
        orderId: toOrderId(payment.id),
        amount: Number(sub.price ?? SUBSCRIBER_PLAN.price),
        billName: profile?.full_name || "Bidje Subscriber",
        billEmail: profile?.email || "",
        billMobile: profile?.phone || "",
        description: `${SUBSCRIBER_PLAN.name} monthly renewal`,
    });

    if (!result.accepted) {
        await supabaseAdmin
            .from("payments")
            .update({ status: "failed", raw_callback: { reason: result.reason } })
            .eq("id", payment.id);
        await markRenewalFailed(sub.user_id);
    }
    return result.accepted;
}

/**
 * Daily job:
 * - auto-renew subscriptions ending within a day (or due a retry) by charging the saved card
 * - expire subscriptions that ended without auto-renew, or with no saved card past the grace period
 */
export async function runSubscriptionRenewals() {
    const now = Date.now();
    const { data: subs, error } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .in("status", ["active", "past_due"]);
    if (error) throw new Error(error.message);

    let charged = 0;
    let expired = 0;
    for (const sub of subs ?? []) {
        const end = new Date(sub.expires_at).getTime();
        const canAutoRenew = sub.auto_renew && !sub.cancel_at_period_end && sub.payment_token;

        if (canAutoRenew) {
            const dueNow = sub.status === "active" ? end - now <= DAY : sub.next_retry_at && new Date(sub.next_retry_at).getTime() <= now;
            if (dueNow) {
                try {
                    if (await chargeRenewal(sub)) charged++;
                } catch (err) {
                    console.error(`Renewal failed for ${sub.user_id}:`, err);
                }
            }
            continue;
        }

        if (now > end + (sub.auto_renew ? RENEWAL_GRACE_DAYS * DAY : 0)) {
            await supabaseAdmin
                .from("subscriptions")
                .update({ status: sub.cancel_at_period_end ? "cancelled" : "expired", updated_at: new Date().toISOString() })
                .eq("user_id", sub.user_id);
            await revokeSubscriberRole(sub.user_id);
            expired++;
        }
    }
    return { checked: subs?.length ?? 0, charged, expired };
}
