import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

/** Investors (and subscribers who can be promoted) with their portfolio size. */
export async function GET() {
    const session = await requireStaffSession();
    if (session.error) return session.error;

    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, phone, role, investor_properties!investor_properties_investor_id_fkey(count)")
        .in("role", ["investor", "subscriber"])
        .order("full_name", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const investors = (data ?? []).map((p) => ({
        id: p.id,
        fullName: p.full_name,
        email: p.email,
        phone: p.phone,
        role: p.role,
        propertyCount: (p.investor_properties as unknown as { count: number }[])?.[0]?.count ?? 0,
    }));

    return NextResponse.json({ investors });
}

/** Promotes a profile to the investor role. */
export async function PATCH(req: Request) {
    const session = await requireStaffSession();
    if (session.error) return session.error;

    const { investorId } = await req.json();
    const { error } = await supabaseAdmin.from("profiles").update({ role: "investor" }).eq("id", investorId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin.from("audit_logs").insert({
        actor_id: session.user.id,
        action: "Changed user role to 'investor'",
        entity: "profiles",
        entity_id: investorId,
    });
    return NextResponse.json({ success: true });
}
