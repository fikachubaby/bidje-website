import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

export async function POST(request: Request) {
    const { pendingPhotoId } = await request.json();
    await supabaseAdmin
        .from("telegram_pending_photos")
        .update({ resolved: true, needs_manual_review: false })
        .eq("id", pendingPhotoId);
    return NextResponse.json({ ok: true });
}