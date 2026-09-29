import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { generateLegalCaseSummary } from "@/lib/ai/legalSummary";

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ stageId: string }> }
) {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    const { stageId } = await params;

    const { data: stage, error } = await supabaseAdmin
        .from("legal_case_stages")
        .select("*, offers!legal_case_stages_offer_id_fkey(properties(title))")
        .eq("id", stageId)
        .single();

    if (error || !stage) {
        return NextResponse.json({ error: error?.message ?? "Stage not found" }, { status: 404 });
    }

    const daysBlocked = stage.started_at
        ? Math.floor((Date.now() - new Date(stage.started_at).getTime()) / 86400000)
        : 0;

    try {
        const summary = await generateLegalCaseSummary({
            stageName: stage.stage_name,
            propertyTitle: stage.offers?.properties?.title,
            daysBlocked,
            blockedReason: stage.blocked_reason,
            notes: stage.notes,
        });

        const { error: updateError } = await supabaseAdmin
            .from("legal_case_stages")
            .update({ ai_summary: summary, ai_summary_generated_at: new Date().toISOString() })
            .eq("id", stageId);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true, summary });
    } catch (err) {
        console.error("AI summary generation failed:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to generate summary" },
            { status: 500 }
        );
    }
}
