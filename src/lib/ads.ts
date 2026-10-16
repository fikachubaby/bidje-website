import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import type { AdPlacement, Advertisement } from "@/types/ad";

/** The highest-priority published ad for a placement that is within its date window. */
export async function getActiveAd(placement: AdPlacement): Promise<Advertisement | null> {
    const now = new Date().toISOString();
    const { data, error } = await supabaseAdmin
        .from("advertisements")
        .select("*")
        .eq("placement", placement)
        .eq("is_active", true)
        .lte("start_date", now)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error("getActiveAd error:", error.message);
        return null;
    }
    return data as Advertisement | null;
}
