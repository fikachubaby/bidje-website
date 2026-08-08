import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { verifyFiuuCallback } from "@/lib/payments/fiuu";

export async function POST(request: Request) {
    const formData = await request.formData();
    const payload = Object.fromEntries(formData.entries()) as Record<string, string>;

    const isValid = verifyFiuuCallback({
        tranID: payload.tranID,
        orderid: payload.orderid,
        status: payload.status,
        domain: payload.domain,
        amount: payload.amount,
        currency: payload.currency,
        paydate: payload.paydate,
        appcode: payload.appcode,
        skey: payload.skey,
    });

    if (!isValid) {
        console.error("[fiuu callback] Invalid skey — possible spoofed callback", payload);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const paymentId = payload.orderid; // we set orderid = payment.id at checkout time
    const isSuccess = payload.status === "00";

    const { data: payment, error } = await supabaseAdmin
        .from("payments")
        .update({
            status: isSuccess ? "success" : "failed",
            gateway_ref: payload.tranID,
            channel: payload.channel,
            paid_at: isSuccess ? new Date().toISOString() : null,
            raw_callback: payload,
        })
        .eq("id", paymentId)
        .select()
        .single();

    if (error || !payment) {
        console.error("[fiuu callback] Payment record not found", paymentId);
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Reflect payment result on the offer itself
    await supabaseAdmin
        .from("offers")
        .update({ payment_status: isSuccess ? "paid" : "failed" })
        .eq("id", payment.reference_id);

    // Fiuu expects a plain "OK" acknowledgement to stop retrying
    return new Response("OK", { status: 200 });
}