import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { analyseInvestorProperty, type AiAnalysis } from "@/lib/ai/portfolioMonitor";
import { INVESTOR_PROPERTY_SELECT, mapInvestorProperty } from "@/lib/investor-server/mapInvestorProperty";

/** Runs the AI blocker analysis for one property and stores the result. */
export async function analyseAndSave(id: string): Promise<AiAnalysis> {
    const { data, error } = await supabaseAdmin
        .from("investor_properties")
        .select(INVESTOR_PROPERTY_SELECT)
        .eq("id", id)
        .single();
    if (error) throw new Error(error.message);

    const analysis = await analyseInvestorProperty(mapInvestorProperty(data));
    const { error: saveErr } = await supabaseAdmin
        .from("investor_properties")
        .update({ ai_analysis: analysis, ai_analyzed_at: new Date().toISOString() })
        .eq("id", id);
    if (saveErr) throw new Error(saveErr.message);
    return analysis;
}

/** Analyses many properties a few at a time; failures are reported, not thrown. */
export async function analyseMany(ids: string[], concurrency = 2) {
    const failed: string[] = [];
    let next = 0;
    async function worker() {
        while (next < ids.length) {
            const id = ids[next++];
            try {
                await analyseAndSave(id);
            } catch (err) {
                console.error(`AI analysis failed for ${id}:`, err);
                failed.push(id);
            }
        }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, ids.length) }, worker));
    return { analysed: ids.length - failed.length, failed };
}
