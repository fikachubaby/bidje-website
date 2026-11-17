import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { buildFiuuCheckoutForm, toOrderId } from "@/lib/payments/fiuu";
import { OFFER_COMMITMENT_FEE } from "@/lib/offers/commitmentFee";

interface OfferCheckoutBody {
    propertyId?: string;
    offerPrice?: number;
    deposit?: number | null;
    purchaseMethod?: string;
    financingConsultantId?: string | null;
    legalFirmId?: string | null;
    contactPhone?: string;
}

/**
 * Creates the offer (unpaid) and starts the RM500 commitment fee on Fiuu's hosted page.
 * Only the signed callback marks the offer as paid.
 */
export async function POST(request: Request) {
    const cookieStore = await cookies();
    // The user's own client, so offer RLS and the loan-balance / screening triggers apply as before.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await request.json()) as OfferCheckoutBody;
    if (!body.propertyId || !body.offerPrice || body.offerPrice <= 0) {
        return NextResponse.json({ error: "Missing offer details" }, { status: 400 });
    }

    // 1. Create the offer, awaiting payment
    const { data: offer, error: offerError } = await supabase
        .from("offers")
        .insert({
            property_id: body.propertyId,
            user_id: user.id,
            offer_price: body.offerPrice,
            deposit: body.deposit ?? null,
            purchase_method: body.purchaseMethod ?? null,
            financing_consultant_id: body.financingConsultantId || null,
            legal_firm_id: body.legalFirmId || null,
            contact_phone: body.contactPhone ?? null,
            payment_status: "Pending",
        })
        .select("id")
        .single();

    if (offerError || !offer) {
        const msg = offerError?.message ?? "";
        const error = msg.includes("Price offered is lower than loan balance")
            ? "Price offered is lower than loan balance"
            : msg.includes("Financing screening required")
                ? "Complete financing screening before submitting a loan offer."
                : "Failed to submit offer. Please try again.";
        if (offerError) console.error("[offer checkout] insert failed:", offerError.message);
        return NextResponse.json({ error }, { status: 400 });
    }

    // 2. Create the payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
        .from("payments")
        .insert({
            user_id: user.id,
            type: "offer_fee",
            reference_id: offer.id,
            amount: OFFER_COMMITMENT_FEE,
            status: "pending",
            gateway: "fiuu",
        })
        .select("id")
        .single();

    if (paymentError || !payment) {
        return NextResponse.json({ error: paymentError?.message ?? "Could not start payment" }, { status: 500 });
    }

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("full_name, email, phone")
        .eq("id", user.id)
        .single();

    // 3. Build the signed Fiuu checkout form
    const origin = new URL(request.url).origin;
    const back = "/dashboard?tab=offers";
    const checkout = buildFiuuCheckoutForm({
        orderId: toOrderId(payment.id),
        amount: OFFER_COMMITMENT_FEE,
        billName: profile?.full_name || user.user_metadata?.full_name || "Bidje Buyer",
        billEmail: profile?.email || user.email || "",
        billMobile: profile?.phone || body.contactPhone || "",
        billDesc: `Bidje offer commitment fee (${offer.id.slice(0, 8)})`,
        returnUrl: `${origin}/api/payments/fiuu/return?next=${encodeURIComponent(back)}&key=offer_payment`,
        callbackUrl: `${origin}/api/payments/fiuu/callback`,
        cancelUrl: `${origin}${back}&offer_payment=cancelled`,
    });

    return NextResponse.json({ offerId: offer.id, checkout });
}
