import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { buildFiuuCheckoutForm } from "@/lib/payments/fiuu";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, offerPrice, contactPhone } = body;

    // 1. Create the offer as pending
    const { data: offer, error: offerError } = await supabaseAdmin
        .from("offers")
        .insert({
            property_id: propertyId,
            user_id: user.id,
            offer_price: offerPrice,
            contact_phone: contactPhone,
            status: "pending",
            payment_status: "pending",
        })
        .select()
        .single();

    if (offerError) {
        return NextResponse.json({ error: offerError.message }, { status: 400 });
    }

    // 2. Create the payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
        .from("payments")
        .insert({
            user_id: user.id,
            type: "offer_fee",
            reference_id: offer.id,
            amount: 500,
            status: "pending",
            gateway: "fiuu",
        })
        .select()
        .single();

    if (paymentError) {
        return NextResponse.json({ error: paymentError.message }, { status: 400 });
    }

    // 3. Build the signed Fiuu checkout form
    const origin = new URL(request.url).origin;
    const checkout = buildFiuuCheckoutForm({
        orderId: payment.id, // use payment.id as the unique order reference
        amount: 500,
        billName: user.user_metadata?.full_name || "Bidje Buyer",
        billEmail: user.email || "",
        billDesc: `Commitment fee for offer ${offer.id}`,
        returnUrl: `${origin}/offers/${offer.id}/payment-result`,
        callbackUrl: `${origin}/api/payments/fiuu/callback`,
        cancelUrl: `${origin}/properties/${propertyId}/make-offer`,
    });

    return NextResponse.json({ offerId: offer.id, checkout });
}