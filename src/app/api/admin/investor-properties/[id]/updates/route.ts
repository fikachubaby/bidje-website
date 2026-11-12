import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;
    const { category, message, visibleToInvestor = true } = await req.json();

    if (!message?.trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    const { error } = await supabaseAdmin.from("investor_property_updates").insert({
        investor_property_id: id,
        category: category || "general",
        message: message.trim(),
        visible_to_investor: Boolean(visibleToInvestor),
        created_by: session.user.id,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin
        .from("investor_properties")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", id);

    return NextResponse.json({ success: true }, { status: 201 });
}

/** Removes one update (e.g. one posted twice by mistake). */
export async function DELETE(req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;

    const updateId = new URL(req.url).searchParams.get("updateId");
    if (!updateId) return NextResponse.json({ error: "Missing update" }, { status: 400 });

    const { error } = await supabaseAdmin
        .from("investor_property_updates")
        .delete()
        .eq("id", updateId)
        .eq("investor_property_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin.from("audit_logs").insert({
        actor_id: session.user.id,
        action: "Deleted investor property update",
        entity: "investor_property_updates",
        entity_id: updateId,
    });
    return NextResponse.json({ success: true });
}
