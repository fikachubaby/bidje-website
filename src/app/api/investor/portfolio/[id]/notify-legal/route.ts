import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { sendEmail } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";
import { normalizePhone, isMalaysianMobile } from "@/lib/phone";

type Params = { params: Promise<{ id: string }> };
type ChannelResult = { channel: "whatsapp" | "email"; ok: boolean; error?: string };

const AUDIT_ACTION = "Investor notified legal firm";
const COOLDOWN_MINUTES = 10;

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Twilio template variables must be non-empty and single-line. */
function templateVar(value: string | null | undefined, fallback = "-"): string {
    const v = (value ?? "").replace(/\s+/g, " ").trim();
    return v || fallback;
}

function errMessage(err: unknown): string {
    return err instanceof Error ? err.message : "Unknown error";
}

/** Alerts the investor's legal firm about this property by email (SendGrid) and WhatsApp (Twilio). */
export async function POST(req: Request, { params }: Params) {
    const session = await requireUserSession();
    if (session.error) return session.error;
    const { id } = await params;

    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 500) : "";

    const { data: property, error } = await supabaseAdmin
        .from("investor_properties")
        .select("id, address, ref_no, legal_firms (name, contact_person, email, phone), profiles!investor_properties_investor_id_fkey (full_name, email, phone)")
        .eq("id", id)
        .eq("investor_id", session.user.id)
        .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const firm = property.legal_firms as any;
    const investor = property.profiles as any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    if (!firm) return NextResponse.json({ error: "Choose your legal firm first" }, { status: 400 });
    if (!firm.email && !firm.phone) {
        return NextResponse.json({ error: "Your legal firm has no email or phone number on record" }, { status: 400 });
    }

    // Stop repeated alerts going out from Bidje's email/WhatsApp sender
    const since = new Date(Date.now() - COOLDOWN_MINUTES * 60_000).toISOString();
    const { count } = await supabaseAdmin
        .from("audit_logs")
        .select("id", { count: "exact", head: true })
        .eq("action", AUDIT_ACTION)
        .eq("entity_id", id)
        .gte("created_at", since);
    if (count) {
        return NextResponse.json(
            { error: `Your lawyer was just notified. Please wait ${COOLDOWN_MINUTES} minutes before sending another alert.` },
            { status: 429 }
        );
    }

    const investorName = investor?.full_name || session.fullName || "A Bidje investor";
    const investorEmail: string | null = investor?.email ?? session.user.email ?? null;
    const investorPhone: string | null = investor?.phone ?? null;
    const greeting = firm.contact_person || firm.name;
    const propertyLabel = property.ref_no ? `${property.address} (Ref: ${property.ref_no})` : property.address;
    const investorContact = [investorPhone, investorEmail].filter(Boolean).join(" / ");

    const sends: Promise<ChannelResult>[] = [];

    if (firm.email) {
        const html = `<p>Dear ${escapeHtml(greeting)},</p>
<p>${escapeHtml(investorName)} has appointed <b>${escapeHtml(firm.name)}</b> as the legal firm for the property below and would like you to follow up.</p>
<p><b>Property:</b> ${escapeHtml(propertyLabel)}<br/>
<b>Client:</b> ${escapeHtml(investorName)}${investorContact ? `<br/><b>Contact:</b> ${escapeHtml(investorContact)}` : ""}</p>
${message ? `<p><b>Message from your client:</b><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>` : ""}
<p>You can reply to this email to reach ${escapeHtml(investorName)} directly.</p>
<p>— Bidje</p>`;
        sends.push(
            sendEmail(firm.email, `Legal follow-up requested: ${property.address}`, html, investorEmail ?? undefined)
                .then((): ChannelResult => ({ channel: "email", ok: true }))
                .catch((err): ChannelResult => ({ channel: "email", ok: false, error: errMessage(err) }))
        );
    }

    if (firm.phone) {
        const templateSid = process.env.TWILIO_LEGAL_ALERT_TEMPLATE_SID;
        const phone = normalizePhone(firm.phone);
        if (!templateSid) {
            sends.push(Promise.resolve({ channel: "whatsapp", ok: false, error: "TWILIO_LEGAL_ALERT_TEMPLATE_SID is not configured" }));
        } else if (!phone || (phone.startsWith("+60") && !isMalaysianMobile(phone))) {
            sends.push(Promise.resolve({ channel: "whatsapp", ok: false, error: `${firm.phone} is not a WhatsApp mobile number` }));
        } else {
            sends.push(
                sendWhatsApp(phone, templateSid, {
                    1: templateVar(greeting),
                    2: templateVar(investorName),
                    3: templateVar(propertyLabel),
                    4: templateVar(investorContact),
                    5: templateVar(message),
                })
                    .then((): ChannelResult => ({ channel: "whatsapp", ok: true }))
                    .catch((err): ChannelResult => ({ channel: "whatsapp", ok: false, error: errMessage(err) }))
            );
        }
    }

    const results = await Promise.all(sends);
    const sent = results.filter((r) => r.ok);

    if (sent.length === 0) {
        console.error("notify-legal failed", id, results);
        return NextResponse.json(
            { error: `Couldn't reach ${firm.name}: ${results.map((r) => r.error).join("; ")}`, results },
            { status: 502 }
        );
    }

    const channels = sent.map((r) => (r.channel === "email" ? "email" : "WhatsApp")).join(" and ");
    await Promise.all([
        supabaseAdmin.from("audit_logs").insert({
            actor_id: session.user.id,
            action: AUDIT_ACTION,
            entity: "investor_properties",
            entity_id: id,
        }),
        supabaseAdmin.from("investor_property_updates").insert({
            investor_property_id: id,
            category: "legal",
            message: `${firm.name} was notified by ${channels}${message ? `: "${message}"` : "."}`,
            visible_to_investor: true,
            created_by: session.user.id,
        }),
    ]);

    return NextResponse.json({ success: true, results });
}
