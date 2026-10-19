import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { INVESTOR_DETAIL_FIELDS } from "@/lib/investor";
import {
    INVESTOR_PROPERTY_SELECT,
    mapInvestorProperty,
    toInvestorPropertyRow,
} from "@/lib/investor-server/mapInvestorProperty";

type Params = { params: Promise<{ id: string }> };

/** Lets an investor update contractor details and phase timeframes on their own property. */
export async function PATCH(req: Request, { params }: Params) {
    const session = await requireUserSession();
    if (session.error) return session.error;
    const { id } = await params;

    const body = await req.json();
    const input: Record<string, unknown> = {};
    for (const key of INVESTOR_DETAIL_FIELDS) if (key in body) input[key] = body[key];

    const { data, error } = await supabaseAdmin
        .from("investor_properties")
        .update({ ...toInvestorPropertyRow(input), updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("investor_id", session.user.id)
        .select(INVESTOR_PROPERTY_SELECT)
        .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ property: mapInvestorProperty(data, { investorView: true }) });
}
