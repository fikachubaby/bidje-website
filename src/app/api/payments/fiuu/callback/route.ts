import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { fromOrderId, parseExtraP, verifyFiuuCallback } from "@/lib/payments/fiuu";
import { activateOrExtend } from "@/lib/subscriptions/server";
import { markRenewalFailed } from "@/lib/subscriptions/renewals";

/**
 * Signed server-to-server result from Fiuu, for offer fees and subscriptions
 * (first payment and auto-renew charges). Safe to receive more than once.
 */
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
        console.error("[fiuu callback] Invalid signature for order", payload.orderid);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Callback-URL deliveries (nbcb=1, incl. token charges) must be acknowledged with this exact text.
    const ack = () => new Response(payload.nbcb === "1" ? "CBTOKEN:MPSTATOK" : "OK", { status: 200 });

    const paymentId = fromOrderId(payload.orderid);
    if (payload.status === "22") return ack(); // still pending; Fiuu will call again

    const { data: existing } = await supabaseAdmin.from("payments").select("*").eq("id", paymentId).maybeSingle();
    if (!existing) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    if (existing.status === "success") return ack(); // already processed

    const isSuccess = payload.status === "00";
    const { data: payment, error } = await supabaseAdmin
        .from("payments")
        .update({
            status: isSuccess ? "success" : "failed",
            gateway_ref: payload.tranID,
            channel: payload.channel ?? existing.channel,
            paid_at: isSuccess ? new Date().toISOString() : null,
            raw_callback: { ...payload, skey: undefined },
        })
        .eq("id", paymentId)
        .select()
        .single();

    if (error || !payment) {
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.type === "subscription") {
        if (isSuccess) {
            const token = parseExtraP(payload.extraP);
            await activateOrExtend(payment.user_id, { paymentToken: token?.token, cardLabel: token?.cardLabel });
        } else if (payment.channel === "auto-renew") {
            await markRenewalFailed(payment.user_id);
        }
        return ack();
    }

    // Offer commitment fee
    await supabaseAdmin
        .from("offers")
        .update({ payment_status: isSuccess ? "Paid" : "Failed" })
        .eq("id", payment.reference_id);

    if (isSuccess) {
        const invoiceContent = `INVOICE - BIDJE PROPERTY\nOffer ID: ${payment.reference_id}\nAmount: ${payment.amount} MYR\nStatus: PAID\nDate: ${new Date().toISOString()}`;
        const fileName = `invoices/${payment.reference_id}-${Date.now()}.txt`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from("documents")
            .upload(fileName, Buffer.from(invoiceContent), { contentType: "text/plain", upsert: true });

        if (!uploadError) {
            const { data: publicUrlData } = supabaseAdmin.storage.from("documents").getPublicUrl(fileName);

            await supabaseAdmin.from("offer_invoices").insert({
                offer_id: payment.reference_id,
                user_id: payment.user_id,
                invoice_url: publicUrlData.publicUrl,
                amount: payment.amount,
            });
        }
    }

    return ack();
}
