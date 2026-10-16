import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { sendWhatsApp } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email";
import { normalizePhone, isMalaysianMobile } from "@/lib/phone";

export type ChannelResult = { channel: "whatsapp" | "email"; ok: boolean; error?: string };

export const REMINDER_SELECT = `*, profiles!reminders_investor_id_fkey (full_name, email, phone), properties (title), investor_properties (address)`;

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

async function sendWhatsAppChannel(phoneRaw: string | null | undefined, vars: Record<string, string>): Promise<ChannelResult> {
    const templateSid = process.env.TWILIO_REMINDER_TEMPLATE_SID;
    const phone = normalizePhone(phoneRaw);

    if (!templateSid) return { channel: "whatsapp", ok: false, error: "TWILIO_REMINDER_TEMPLATE_SID is not configured" };
    if (!phoneRaw) return { channel: "whatsapp", ok: false, error: "Investor has no phone number" };
    if (!phone) return { channel: "whatsapp", ok: false, error: `Invalid phone number: ${phoneRaw}` };
    if (phone.startsWith("+60") && !isMalaysianMobile(phone)) {
        return { channel: "whatsapp", ok: false, error: `${phone} is not a mobile number; WhatsApp needs a mobile` };
    }
    try {
        await sendWhatsApp(phone, templateSid, vars);
        return { channel: "whatsapp", ok: true };
    } catch (err) {
        return { channel: "whatsapp", ok: false, error: errMessage(err) };
    }
}

async function sendEmailChannel(email: string | null | undefined, subject: string, html: string): Promise<ChannelResult> {
    if (!email) return { channel: "email", ok: false, error: "Investor has no email address" };
    try {
        await sendEmail(email, subject, html);
        return { channel: "email", ok: true };
    } catch (err) {
        return { channel: "email", ok: false, error: errMessage(err) };
    }
}

/**
 * Sends one reminder on its chosen channel(s) — WhatsApp, email, or both at once.
 * Used by the Send button, new reminders and the daily cron, so behaviour stays identical.
 */
export async function deliverReminder(id: string): Promise<{ found: boolean; results: ChannelResult[] }> {
    const { data: rem, error } = await supabaseAdmin.from("reminders").select(REMINDER_SELECT).eq("id", id).single();
    if (error || !rem) return { found: false, results: [] };

    const investor = rem.profiles;
    const propertyTitle = rem.properties?.title ?? rem.investor_properties?.address ?? "your property";
    const name = investor?.full_name || "Investor";
    const due = formatDueDate(rem.due_date);

    const sends: Promise<ChannelResult>[] = [];
    if (rem.channel === "whatsapp" || rem.channel === "both") {
        // Template variables must be non-empty strings
        sends.push(sendWhatsAppChannel(investor?.phone, { 1: name, 2: propertyTitle, 3: rem.title, 4: due }));
    }
    if (rem.channel === "email" || rem.channel === "both") {
        sends.push(
            sendEmailChannel(
                investor?.email,
                `Reminder: ${rem.title}`,
                `<p>Hi ${name},</p><p>A reminder for your property <b>${propertyTitle}</b>: <b>${rem.title}</b> is due on ${due}.</p>${
                    rem.description ? `<p>${rem.description}</p>` : ""
                }<p>— Bidje</p>`
            )
        );
    }
    const results = await Promise.all(sends);

    await supabaseAdmin.from("reminder_logs").insert(
        results.map((r) => ({
            reminder_id: id,
            channel: r.channel,
            status: r.ok ? "sent" : "failed",
            error_message: r.error ?? null,
        }))
    );

    // Only record a send if at least one channel actually delivered
    if (results.some((r) => r.ok)) {
        await supabaseAdmin.from("reminders").update({ last_sent_at: new Date().toISOString() }).eq("id", id);
    }
    return { found: true, results };
}
