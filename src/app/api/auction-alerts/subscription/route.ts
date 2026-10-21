import { NextResponse } from "next/server";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { normalizePhone } from "@/lib/phone";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

const CONSENT_VERSION = "2026-10-22-v1";
const CONSENT_SOURCE = "profile";

export async function GET() {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const { data, error } = await supabaseAdmin
        .from("auction_alert_subscriptions")
        .select("phone, opted_in, opted_in_at, opted_out_at, consent_text_version, consent_source")
        .eq("user_id", session.user.id)
        .maybeSingle();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        subscription: data ?? {
            phone: null,
            opted_in: false,
            opted_in_at: null,
            opted_out_at: null,
            consent_text_version: CONSENT_VERSION,
            consent_source: CONSENT_SOURCE,
        },
    });
}

export async function PATCH(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const body = await req.json();
    const optedIn = body.optedIn === true;

    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("phone")
        .eq("id", session.user.id)
        .single();

    if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const phone = normalizePhone(profile?.phone ?? null);
    if (optedIn && !phone) {
        return NextResponse.json(
            { error: "Add a valid mobile number to your profile before enabling WhatsApp auction alerts." },
            { status: 400 }
        );
    }

    const now = new Date().toISOString();
    const storedPhone = phone ?? "+60000000000";

    const { data, error } = await supabaseAdmin
        .from("auction_alert_subscriptions")
        .upsert(
            {
                user_id: session.user.id,
                phone: storedPhone,
                opted_in: optedIn,
                consent_text_version: CONSENT_VERSION,
                consent_source: CONSENT_SOURCE,
                opted_in_at: optedIn ? now : null,
                opted_out_at: optedIn ? null : now,
                updated_at: now,
            },
            { onConflict: "user_id" }
        )
        .select("phone, opted_in, opted_in_at, opted_out_at")
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, subscription: data });
}
