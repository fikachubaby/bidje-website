import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { generateLegalCaseSummary } from "@/lib/ai/legalSummary";

export async function GET(req: Request) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: stages, error } = await supabaseAdmin
        .from("legal_case_stages")
        .select("*, offers!legal_case_stages_offer_id_fkey(properties(title))")
        .or("status.eq.blocked,expected_by.lt.now()")
        .neq("status", "completed");

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let updated = 0;

    for (const stage of stages ?? []) {
        // Skip if already summarized recently (within 24h) to avoid re-billing for unchanged cases
        if (
            stage.ai_summary_generated_at &&
            Date.now() - new Date(stage.ai_summary_generated_at).getTime() < 86400000
        ) {
            continue;
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

            await supabaseAdmin
                .from("legal_case_stages")
                .update({ ai_summary: summary, ai_summary_generated_at: new Date().toISOString() })
                .eq("id", stage.id);

            updated++;
        } catch (err) {
            console.error(`Failed to summarize stage ${stage.id}:`, err);
        }
    }

    return NextResponse.json({ success: true, checked: stages?.length ?? 0, updated });
}
