import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

export async function GET() {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    const { data, error } = await supabaseAdmin
        .from("legal_case_stages")
        .select(`
      *,
      offers!legal_case_stages_offer_id_fkey (
        id,
        properties (title),
        profiles!offers_user_id_fkey (full_name)
      ),
      legal_firms (name)
    `)
        .neq("status", "completed")
        .neq("status", "waived")
        .order("stage_order", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (data ?? []).map((s) => ({
        id: s.id,
        offerId: s.offer_id,
        stageName: s.stage_name,
        stageOrder: s.stage_order,
        stageCategory: s.stage_category,
        status: s.status,
        startedAt: s.started_at,
        completedAt: s.completed_at,
        expectedBy: s.expected_by,
        blockedReason: s.blocked_reason,
        assignedTo: s.assigned_to,
        legalFirmId: s.legal_firm_id,
        notes: s.notes,
        updatedAt: s.updated_at,
        propertyTitle: s.offers?.properties?.title,
        buyerName: s.offers?.profiles?.full_name,
        legalFirmName: s.legal_firms?.name,
        aiSummary: s.ai_summary,
        aiSummaryGeneratedAt: s.ai_summary_generated_at,
    }));

    return NextResponse.json({ stages: mapped });
}
