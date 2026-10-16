import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

const ADMIN_EMAIL = process.env.CONTACT_ADMIN_EMAIL ?? "admin@bidje.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function layout(body: string) {
    return `
<div style="background:#f5f5f5;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#171717">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:2px solid #000;border-radius:16px;overflow:hidden">
    <div style="background:#ffd400;border-bottom:2px solid #000;padding:20px 24px;font-size:22px;font-weight:900">Bidje</div>
    <div style="padding:24px;font-size:14px;line-height:1.6">${body}</div>
    <div style="padding:16px 24px;border-top:1px solid #e5e5e5;font-size:12px;color:#737373">
      Bidje · <a href="mailto:${ADMIN_EMAIL}" style="color:#737373">${ADMIN_EMAIL}</a>
    </div>
  </div>
</div>`;
}

export async function POST(req: Request) {
    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim().slice(0, 200);
    const email = String(body?.email ?? "").trim().slice(0, 320);
    const subject = String(body?.subject ?? "").trim().slice(0, 200);
    const message = String(body?.message ?? "").trim().slice(0, 5000);

    if (!name || !subject || !message || !EMAIL_RE.test(email)) {
        return NextResponse.json({ error: "Please fill in all fields with a valid email." }, { status: 400 });
    }

    const n = escapeHtml(name);
    const e = escapeHtml(email);
    const s = escapeHtml(subject);
    const m = escapeHtml(message).replace(/\n/g, "<br>");

    try {
        await sendEmail(
            ADMIN_EMAIL,
            `[Contact] ${subject}`,
            layout(`
<h2 style="margin:0 0 16px;font-size:18px">New direct message</h2>
<p style="margin:0"><strong>From:</strong> ${n} &lt;<a href="mailto:${e}">${e}</a>&gt;</p>
<p style="margin:4px 0 16px"><strong>Subject:</strong> ${s}</p>
<div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:12px;padding:16px">${m}</div>`)
        );
    } catch (err) {
        console.error("Contact form: admin email failed", err);
        return NextResponse.json({ error: "We couldn't send your message. Please email us directly." }, { status: 502 });
    }

    // The admin copy is what matters; a failed acknowledgement shouldn't fail the request.
    try {
        await sendEmail(
            email,
            "We've received your message — Bidje",
            layout(`
<h2 style="margin:0 0 16px;font-size:18px">Hi ${n},</h2>
<p>Thanks for reaching out. We've received your message and our team will get back to you within 24–48 working hours.</p>
<p style="margin:16px 0 8px;font-weight:bold">Your message</p>
<div style="background:#fafafa;border:1px solid #e5e5e5;border-radius:12px;padding:16px">
  <p style="margin:0 0 8px"><strong>${s}</strong></p>${m}
</div>
<p style="margin-top:16px">If you need to add anything, just reply to <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a>.</p>
<p>— The Bidje Team</p>`)
        );
    } catch (err) {
        console.error("Contact form: acknowledgement email failed", err);
    }

    return NextResponse.json({ ok: true });
}
