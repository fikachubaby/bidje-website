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
        console.error("[fiuu callback] Invalid signature", payload);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const paymentId = payload.orderid;
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
        return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

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

    return new Response("OK", { status: 200 });
}