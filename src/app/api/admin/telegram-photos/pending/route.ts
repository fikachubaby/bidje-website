import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("telegram_pending_photos")
        .select("id, file_id, chat_id, created_at")
        .eq("needs_manual_review", true)
        .eq("resolved", false)
        .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ photos: data ?? [] });
}