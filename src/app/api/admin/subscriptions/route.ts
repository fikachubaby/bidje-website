import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

/** Every subscription (Fiuu-paid or admin-approved) with the subscriber's details and last payment. */
export async function GET(req: Request) {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    const status = new URL(req.url).searchParams.get("status") || "all";
    let query = supabaseAdmin.from("subscriptions").select("*").order("expires_at", { ascending: true });
    if (status !== "all") query = query.eq("status", status);

    const { data: subs, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const userIds = (subs ?? []).map((s) => s.user_id);
    const [{ data: profiles }, { data: payments }] = await Promise.all([
        supabaseAdmin.from("profiles").select("id, full_name, email, phone").in("id", userIds.length ? userIds : [""]),
        supabaseAdmin
            .from("payments")
            .select("user_id, amount, status, paid_at, created_at")
            .eq("type", "subscription")
            .in("user_id", userIds.length ? userIds : [""])
            .order("created_at", { ascending: false }),
    ]);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const lastPayment = new Map<string, NonNullable<typeof payments>[number]>();
    for (const p of payments ?? []) if (!lastPayment.has(p.user_id) && p.status !== "pending") lastPayment.set(p.user_id, p);

    return NextResponse.json({
        subscriptions: (subs ?? []).map((s) => {
            const profile = profileMap.get(s.user_id);
            const last = lastPayment.get(s.user_id);
            return {
                userId: s.user_id,
                name: profile?.full_name ?? "Unknown",
                email: profile?.email ?? "",
                phone: profile?.phone ?? "",
                status: s.status,
                startedAt: s.started_at,
                expiresAt: s.expires_at,
                autoRenew: Boolean(s.auto_renew) && !s.cancel_at_period_end,
                cardLabel: s.card_label ?? (s.payment_token ? "Saved card" : null),
                renewalFailures: s.renewal_failures ?? 0,
                lastPayment: last
                    ? { amount: Number(last.amount), status: last.status, at: last.paid_at ?? last.created_at }
                    : null,
            };
        }),
    });
}
