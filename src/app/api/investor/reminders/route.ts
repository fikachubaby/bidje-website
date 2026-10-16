import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";

/** Lightweight count of the signed-in investor's scheduled reminders, for the navbar bell. */
export async function GET() {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const { count, error } = await supabaseAdmin
        .from("reminders")
        .select("id", { count: "exact", head: true })
        .eq("investor_id", session.user.id)
        .eq("status", "scheduled")
        .not("investor_property_id", "is", null);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ upcoming: count ?? 0 });
}
