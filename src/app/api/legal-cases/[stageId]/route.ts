import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ stageId: string }> }
) {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    const { stageId } = await params;
    const body = await request.json();

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) updates.status = body.status;
    if (body.blockedReason !== undefined) updates.blocked_reason = body.blockedReason;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.legalFirmId !== undefined) updates.legal_firm_id = body.legalFirmId;

    if (body.status === "completed") {
        updates.completed_at = new Date().toISOString();
    }
    if (body.status === "in_progress" && body.markStarted) {
        updates.started_at = new Date().toISOString();
    }

    const { data: updatedStage, error } = await supabaseAdmin
        .from("legal_case_stages")
        .update(updates)
        .eq("id", stageId)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // When a stage completes, auto-start the next stage in sequence for the same offer
    if (body.status === "completed") {
        const { data: nextStage } = await supabaseAdmin
            .from("legal_case_stages")
            .select("id")
            .eq("offer_id", updatedStage.offer_id)
            .eq("status", "pending")
            .order("stage_order", { ascending: true })
            .limit(1)
            .maybeSingle();

        if (nextStage) {
            await supabaseAdmin
                .from("legal_case_stages")
                .update({ status: "in_progress", started_at: new Date().toISOString() })
                .eq("id", nextStage.id);
        }
    }

    return NextResponse.json({ success: true, stage: updatedStage });
}
