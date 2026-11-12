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

    // Reminders are removed with the property, but their send history would block that.
    const { data: reminders } = await supabaseAdmin.from("reminders").select("id").eq("investor_property_id", id);
    const reminderIds = (reminders ?? []).map((r) => r.id);
    if (reminderIds.length) {
        const { error: logErr } = await supabaseAdmin.from("reminder_logs").delete().in("reminder_id", reminderIds);
        if (logErr) return NextResponse.json({ error: logErr.message }, { status: 500 });
    }

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
