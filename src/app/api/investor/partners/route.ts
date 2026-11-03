import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { listInvestorPartners, PARTNER_TABLE, type PartnerKind } from "@/lib/investor-server/partners";

/** Legal firms and financing consultants the signed-in investor can choose from. */
export async function GET() {
    const session = await requireUserSession();
    if (session.error) return session.error;

    try {
        const [legalFirms, financingConsultants] = await Promise.all([
            listInvestorPartners("legal", session.user.id),
            listInvestorPartners("financing", session.user.id),
        ]);
        return NextResponse.json({ legalFirms, financingConsultants });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load partners";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** "Other": the investor keys in their own legal firm or financing consultant. */
export async function POST(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const body = await req.json();
    const kind = body.kind as PartnerKind;
    if (kind !== "legal" && kind !== "financing") {
        return NextResponse.json({ error: "Unknown partner type" }, { status: 400 });
    }

    const name = str(body.name);
    if (!name) {
        return NextResponse.json({ error: kind === "legal" ? "Firm name is required" : "Consultant name is required" }, { status: 400 });
    }

    // Same fields the admin Legal Consultants / Financial Consultants forms save
    const row: Record<string, unknown> =
        kind === "legal"
            ? {
                  name,
                  contact_person: str(body.contactPerson),
                  email: str(body.email),
                  phone: str(body.phone),
                  address: str(body.address),
              }
            : { name };

    if (kind === "legal" && !row.email && !row.phone) {
        return NextResponse.json({ error: "Please enter the firm's email or phone so they can be contacted" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
        .from(PARTNER_TABLE[kind])
        .insert({ ...row, is_active: true, added_by: session.user.id })
        .select("id, name")
        .single();

    if (error) {
        const msg =
            error.code === "23505"
                ? `"${name}" already exists. Please pick it from the list instead.`
                : error.message;
        return NextResponse.json({ error: msg }, { status: error.code === "23505" ? 409 : 500 });
    }

    await supabaseAdmin.from("audit_logs").insert({
        actor_id: session.user.id,
        action: `Investor added ${kind === "legal" ? "legal firm" : "financing consultant"} '${name}'`,
        entity: PARTNER_TABLE[kind],
        entity_id: data.id,
    });

    return NextResponse.json({ partner: data }, { status: 201 });
}
