import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

type Params = { params: Promise<{ id: string; milestoneId: string }> };

export async function PATCH(req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id, milestoneId } = await params;
    const { done } = await req.json();

    const { error } = await supabaseAdmin
        .from("investor_property_milestones")
        .update({ done: Boolean(done), done_at: done ? new Date().toISOString() : null })
        .eq("id", milestoneId)
        .eq("investor_property_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin
        .from("investor_properties")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", id);

    return NextResponse.json({ success: true });
}
