import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import {
    INVESTOR_PROPERTY_SELECT,
    mapInvestorProperty,
} from "@/lib/investor-server/mapInvestorProperty";

/** The signed-in investor's own portfolio. Admin-only updates are filtered out. */
export async function GET() {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const { data, error } = await supabaseAdmin
        .from("investor_properties")
        .select(INVESTOR_PROPERTY_SELECT)
        .eq("investor_id", session.user.id)
        .order("date_signed", { ascending: true, nullsFirst: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
        investor: { name: session.fullName, email: session.user.email, role: session.role },
        properties: (data ?? []).map((r) => mapInvestorProperty(r, { investorView: true })),
    });
}
