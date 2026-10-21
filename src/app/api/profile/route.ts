import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { normalizePhone } from "@/lib/phone";

export async function GET() {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("full_name, email, phone, role")
        .eq("id", session.user.id)
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ profile: data });
}

/** Users may only change their own name and phone; role/email stay server-controlled. */
export async function PATCH(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const body = await req.json();
    const fullName = String(body.fullName ?? "").trim();
    const phoneRaw = String(body.phone ?? "").trim();
    const phone = phoneRaw ? normalizePhone(phoneRaw) : null;

    if (!fullName) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (phoneRaw && !phone) return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });

    const { error } = await supabaseAdmin
        .from("profiles")
        .update({ full_name: fullName, phone })
        .eq("id", session.user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Keep an existing WhatsApp auction-alert subscription pointed at the latest profile number.
    // If the user removes their phone number, opt them out instead of leaving a stale recipient.
    if (phone) {
        await supabaseAdmin
            .from("auction_alert_subscriptions")
            .update({ phone, updated_at: new Date().toISOString() })
            .eq("user_id", session.user.id)
            .eq("opted_in", true);
    } else {
        const now = new Date().toISOString();
        await supabaseAdmin
            .from("auction_alert_subscriptions")
            .update({
                phone: null,
                opted_in: false,
                opted_in_at: null,
                opted_out_at: now,
                updated_at: now,
            })
            .eq("user_id", session.user.id)
            .eq("opted_in", true);
    }

    // Keep auth metadata in sync; some screens read the name from there.
    await supabaseAdmin.auth.admin.updateUserById(session.user.id, { user_metadata: { full_name: fullName } });

    return NextResponse.json({ success: true, phone });
}
