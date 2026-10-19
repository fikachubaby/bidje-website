import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { buildFiuuCheckoutForm, toOrderId } from "@/lib/payments/fiuu";
import { getOwnedScreening } from "@/lib/financing/screening-server";
import { APPLICANT_TYPE_META } from "@/constants/financing-screening";

/** Starts the screening-fee payment on Fiuu. The signed callback moves the screening to review. */
export async function POST(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const { screeningId, returnPath } = (await req.json()) as { screeningId?: string; returnPath?: string };
    const screening = screeningId ? await getOwnedScreening(session.user.id, screeningId) : null;
    if (!screening) return NextResponse.json({ error: "Screening not found" }, { status: 404 });
    if (screening.status !== "payment_pending" || !screening.consentAt) {
        return NextResponse.json({ error: "Complete your documents and consent first." }, { status: 409 });
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
            type: "financing_screening",
            reference_id: screening.id,
            amount: screening.feeAmount,
            status: "pending",
            gateway: "fiuu",
        })
        .select("id")
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin.from("financing_screenings").update({ payment_id: payment.id }).eq("id", screening.id);

    // Only same-site relative paths, so the return hop can't be used as an open redirect.
    const back = returnPath && returnPath.startsWith("/") && !returnPath.startsWith("//") ? returnPath : "/dashboard";
    const origin = new URL(req.url).origin;
    const checkout = buildFiuuCheckoutForm({
        orderId: toOrderId(payment.id),
        amount: screening.feeAmount,
        billName: profile?.full_name || session.user.email || "Bidje Purchaser",
        billEmail: profile?.email || session.user.email || "",
        billMobile: profile?.phone || "",
        billDesc: `Financing screening fee (${APPLICANT_TYPE_META[screening.applicantType].label})`,
        returnUrl: `${origin}/api/payments/fiuu/return?next=${encodeURIComponent(back)}`,
        callbackUrl: `${origin}/api/payments/fiuu/callback`,
        cancelUrl: `${origin}${back}${back.includes("?") ? "&" : "?"}screening=cancelled`,
    });

    return NextResponse.json({ checkout });
}
