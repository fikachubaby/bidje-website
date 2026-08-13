import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (!q) return NextResponse.json({ properties: [] });

    const { data, error } = await supabaseAdmin
        .from("properties")
        .select("id, title, district, state")
        .or(`title.ilike.%${q}%,district.ilike.%${q}%,state.ilike.%${q}%`)
        .order("created_at", { ascending: false })
        .limit(8);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
        properties: (data ?? []).map((p) => ({
            id: p.id,
            name: p.title,
            district: p.district,
            state: p.state,
        })),
    });
}