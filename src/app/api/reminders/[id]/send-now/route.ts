import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: rem, error } = await supabaseAdmin
        .from("reminders")
        .select(`*, profiles!reminders_investor_id_fkey (full_name, email, phone), properties (title)`)
        .eq("id", id)
        .single();

    if (error || !rem) {
        return NextResponse.json({ error: error?.message ?? "Not found" }, { status: 404 });
    }

    const investor = rem.profiles;
    const property = rem.properties;
    const results: { channel: string; ok: boolean; error?: string }[] = [];

    if ((rem.channel === "whatsapp" || rem.channel === "both") && investor?.phone) {
        try {
            await sendWhatsApp(investor.phone, "HX_your_template_sid", {
                1: investor.full_name ?? "Investor",
                2: property?.title ?? "",
                3: rem.title,
                4: rem.due_date,
            });
            results.push({ channel: "whatsapp", ok: true });
        } catch (err: unknown) {
            results.push({ channel: "whatsapp", ok: false, error: err instanceof Error ? err.message : "Unknown error" });
        }
    }

    if ((rem.channel === "email" || rem.channel === "both") && investor?.email) {
        try {
            await sendEmail(
                investor.email,
                `Reminder: ${rem.title}`,
                `<p>Hi ${investor.full_name ?? ""}, your property <b>${property?.title}</b> update: ${rem.title} is due on ${rem.due_date}.</p>`
            );
            results.push({ channel: "email", ok: true });
        } catch (err: unknown) {
            results.push({ channel: "email", ok: false, error: err instanceof Error ? err.message : "Unknown error" });
        }
    }

    await supabaseAdmin.from("reminders").update({ last_sent_at: new Date().toISOString() }).eq("id", id);

    return NextResponse.json({ success: true, results });
}