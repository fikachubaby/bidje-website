import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { toInvestorPropertyRow } from "@/lib/investor-server/mapInvestorProperty";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;

    const row = { ...toInvestorPropertyRow(await req.json()), updated_at: new Date().toISOString() };
    const { error } = await supabaseAdmin.from("investor_properties").update(row).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;

    const { error } = await supabaseAdmin.from("investor_properties").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin.from("audit_logs").insert({
        actor_id: session.user.id,
        action: "Deleted investor property",
        entity: "investor_properties",
        entity_id: id,
    });
    return NextResponse.json({ success: true });
}
