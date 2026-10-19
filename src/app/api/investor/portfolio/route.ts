import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { defaultMilestoneRows, INVESTOR_DETAIL_FIELDS } from "@/lib/investor";
import {
    INVESTOR_PROPERTY_SELECT,
    mapInvestorProperty,
    toInvestorPropertyRow,
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

/** Fields an investor may fill in themselves; partners and internal notes stay admin-only. */
const INVESTOR_EDITABLE = [
    "refNo",
    "address",
    "state",
    "dateSigned",
    "stage",
    "expectedCompletion",
    "purchasePrice",
    "agentFee",
    "legalCost",
    "renovationCost",
    "otherCost",
    "sellingCost",
    "targetPrice",
    "highestOffer",
    ...INVESTOR_DETAIL_FIELDS,
];

/** Adds a property to the signed-in investor's own portfolio. */
export async function POST(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const body = await req.json();
    if (typeof body.address !== "string" || !body.address.trim()) {
        return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const input: Record<string, unknown> = { investorId: session.user.id };
    for (const key of INVESTOR_EDITABLE) if (key in body) input[key] = body[key];
    input.address = body.address.trim();

    const { data, error } = await supabaseAdmin
        .from("investor_properties")
        .insert(toInvestorPropertyRow(input))
        .select("id")
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { error: mErr } = await supabaseAdmin.from("investor_property_milestones").insert(defaultMilestoneRows(data.id));
    if (mErr) return NextResponse.json({ error: mErr.message }, { status: 500 });

    await supabaseAdmin.from("audit_logs").insert({
        actor_id: session.user.id,
        action: "Investor added a property",
        entity: "investor_properties",
        entity_id: data.id,
    });

    // Re-read so the response includes the milestones just created.
    const { data: full, error: readErr } = await supabaseAdmin
        .from("investor_properties")
        .select(INVESTOR_PROPERTY_SELECT)
        .eq("id", data.id)
        .single();
    if (readErr) return NextResponse.json({ error: readErr.message }, { status: 500 });

    return NextResponse.json({ property: mapInvestorProperty(full, { investorView: true }) }, { status: 201 });
}
