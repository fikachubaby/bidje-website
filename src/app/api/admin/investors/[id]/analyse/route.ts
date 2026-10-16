import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { analyseMany } from "@/lib/investor-server/aiMonitor";

type Params = { params: Promise<{ id: string }> };

export const maxDuration = 300;

/** Analyses every active (not sold/completed) property in an investor's portfolio. */
export async function POST(_req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;

    const { data, error } = await supabaseAdmin
        .from("investor_properties")
        .select("id")
        .eq("investor_id", id)
        .not("stage", "in", "(sold,completed)");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(await analyseMany((data ?? []).map((r) => r.id)));
}
