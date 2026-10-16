import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { getSubscriptionRow, toView } from "@/lib/subscriptions/server";

/** Current plan plus recent subscription payments for the billing card. */
export async function GET() {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const [row, { data: payments }] = await Promise.all([
        getSubscriptionRow(session.user.id),
        supabaseAdmin
            .from("payments")
            .select("id, amount, status, paid_at, created_at, channel")
            .eq("user_id", session.user.id)
            .eq("type", "subscription")
            .neq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(12),
    ]);

    return NextResponse.json({
        subscription: toView(row),
        payments: (payments ?? []).map((p) => ({
            id: p.id,
            amount: Number(p.amount),
            status: p.status,
            paidAt: p.paid_at,
            createdAt: p.created_at,
            channel: p.channel,
        })),
    });
}

/** Turn auto-renew on/off. Turning it off keeps access until the period ends (like Netflix/Spotify). */
export async function PATCH(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const { autoRenew } = await req.json();
    const row = await getSubscriptionRow(session.user.id);
    if (!row) return NextResponse.json({ error: "No subscription found" }, { status: 404 });

    const { error } = await supabaseAdmin
        .from("subscriptions")
        .update({
            auto_renew: Boolean(autoRenew),
            cancel_at_period_end: !autoRenew,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", session.user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ subscription: toView({ ...row, auto_renew: Boolean(autoRenew), cancel_at_period_end: !autoRenew }) });
}
