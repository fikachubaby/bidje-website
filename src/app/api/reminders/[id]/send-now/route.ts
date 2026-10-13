import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";
import { normalizePhone, isMalaysianMobile } from "@/lib/phone";

type ChannelResult = { channel: "whatsapp" | "email"; ok: boolean; error?: string };

function formatDueDate(iso: string): string {
    // iso is "YYYY-MM-DD"; anchor to Malaysia time so the day never shifts
    const d = new Date(`${iso}T00:00:00+08:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kuala_Lumpur",
    }).format(d);
}

function errMessage(err: unknown): string {
    return err instanceof Error ? err.message : "Unknown error";
}

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
    const results: ChannelResult[] = [];

    const wantsWhatsApp = rem.channel === "whatsapp" || rem.channel === "both";
    const wantsEmail = rem.channel === "email" || rem.channel === "both";

    // ---------- WhatsApp ----------
    if (wantsWhatsApp) {
        const templateSid = process.env.TWILIO_REMINDER_TEMPLATE_SID;
        const phone = normalizePhone(investor?.phone);

        if (!templateSid) {
            results.push({
                channel: "whatsapp",
                ok: false,
                error: "TWILIO_REMINDER_TEMPLATE_SID is not configured",
            });
        } else if (!investor?.phone) {
            results.push({ channel: "whatsapp", ok: false, error: "Recipient has no phone number" });
        } else if (!phone) {
            results.push({
                channel: "whatsapp",
                ok: false,
                error: `Invalid phone number: ${investor.phone}`,
            });
        } else if (phone.startsWith("+60") && !isMalaysianMobile(phone)) {
            results.push({
                channel: "whatsapp",
                ok: false,
                error: `${phone} does not look like a mobile number, WhatsApp needs a mobile`,
            });
        } else {
            try {
                // Template variables must be non-empty strings
                await sendWhatsApp(phone, templateSid, {
                    1: investor.full_name || "Investor",
                    2: property?.title || "your property",
                    3: rem.title,
                    4: formatDueDate(rem.due_date),
                });
                results.push({ channel: "whatsapp", ok: true });
            } catch (err: unknown) {
                results.push({ channel: "whatsapp", ok: false, error: errMessage(err) });
            }
        }
    }

    // ---------- Email ----------
    if (wantsEmail) {
        if (!investor?.email) {
            results.push({ channel: "email", ok: false, error: "Recipient has no email address" });
        } else {
            try {
                await sendEmail(
                    investor.email,
                    `Reminder: ${rem.title}`,
                    `<p>Hi ${investor.full_name ?? ""}, your property <b>${property?.title ?? ""}</b> update: ${rem.title} is due on ${formatDueDate(rem.due_date)}.</p>`
                );
                results.push({ channel: "email", ok: true });
            } catch (err: unknown) {
                results.push({ channel: "email", ok: false, error: errMessage(err) });
            }
        }
    }

    const anyOk = results.some((r) => r.ok);

    // Only record a send if at least one channel actually delivered
    if (anyOk) {
        const { error: updateError } = await supabaseAdmin
            .from("reminders")
            .update({ last_sent_at: new Date().toISOString() })
            .eq("id", id);

        if (updateError) {
            console.error("Failed to update last_sent_at:", updateError.message);
        }
    }

    return NextResponse.json(
        { success: anyOk, results },
        { status: anyOk ? 200 : 502 }
    );
}
