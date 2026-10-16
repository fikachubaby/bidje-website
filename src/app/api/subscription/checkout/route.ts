import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { buildFiuuCheckoutForm, toOrderId } from "@/lib/payments/fiuu";
import { SUBSCRIBER_PLAN } from "@/lib/subscriptions/plan";

/** Starts a subscription payment on Fiuu's hosted page. The card is saved for auto-renewal. */
export async function POST(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;
    if (["admin", "staff", "investor"].includes(session.role)) {
        return NextResponse.json({ error: "This account type doesn't need a subscription." }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", session.user.id)
        .single();

    const { data: payment, error } = await supabaseAdmin
        .from("payments")
        .insert({
            user_id: session.user.id,
            type: "subscription",
            amount: SUBSCRIBER_PLAN.price,
            status: "pending",
            gateway: "fiuu",
        })
        .select("id")
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const origin = new URL(req.url).origin;
    const checkout = buildFiuuCheckoutForm({
        orderId: toOrderId(payment.id),
        amount: SUBSCRIBER_PLAN.price,
        billName: profile?.full_name || session.user.email || "Bidje Subscriber",
        billEmail: profile?.email || session.user.email || "",
        billMobile: profile?.phone || "",
        billDesc: `${SUBSCRIBER_PLAN.name} - 1 month`,
        returnUrl: `${origin}/api/payments/fiuu/return`,
        callbackUrl: `${origin}/api/payments/fiuu/callback`,
        cancelUrl: `${origin}/dashboard?tab=billing&payment=cancelled`,
    });

    return NextResponse.json({ checkout });
}
