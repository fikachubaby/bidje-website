import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { defaultMilestoneRows } from "@/lib/investor";
import {
    INVESTOR_PROPERTY_SELECT,
    mapInvestorProperty,
    toInvestorPropertyRow,
} from "@/lib/investor-server/mapInvestorProperty";

export async function GET(req: Request) {
    const session = await requireStaffSession();
    if (session.error) return session.error;

    const investorId = new URL(req.url).searchParams.get("investorId");
    let query = supabaseAdmin
        .from("investor_properties")
        .select(INVESTOR_PROPERTY_SELECT)
        .order("date_signed", { ascending: true, nullsFirst: false });
    if (investorId) query = query.eq("investor_id", investorId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ properties: (data ?? []).map((r) => mapInvestorProperty(r)) });
}

/** Creates one property, or many when the body is { investorId, rows: [...] } (spreadsheet import). */
export async function POST(req: Request) {
    const session = await requireStaffSession();
    if (session.error) return session.error;

    const body = await req.json();
    const inputs: Record<string, unknown>[] = Array.isArray(body.rows)
        ? body.rows.map((r: Record<string, unknown>) => ({ ...r, investorId: body.investorId }))
        : [body];

    if (!inputs.length || inputs.some((i) => !i.investorId || !i.address)) {
        return NextResponse.json({ error: "investorId and address are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from("investor_properties")
        .insert(inputs.map(toInvestorPropertyRow))
        .select("id");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const milestoneRows = (data ?? []).flatMap((r) => defaultMilestoneRows(r.id));
    if (milestoneRows.length) {
        const { error: mErr } = await supabaseAdmin.from("investor_property_milestones").insert(milestoneRows);
        if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });
    }

    await supabaseAdmin.from("audit_logs").insert({
        actor_id: session.user.id,
        action: `Added ${data?.length ?? 0} investor propert${data?.length === 1 ? "y" : "ies"}`,
        entity: "investor_properties",
        entity_id: data?.length === 1 ? data[0].id : null,
    });

    return NextResponse.json({ created: data?.length ?? 0 }, { status: 201 });
}
