import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { downloadTelegramPhoto } from "@/lib/telegram/telegram-bot";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { data: photo } = await supabaseAdmin
        .from("telegram_pending_photos")
        .select("file_id")
        .eq("id", id)
        .single();

    if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const bytes = await downloadTelegramPhoto(photo.file_id);
    return new NextResponse(new Uint8Array(bytes), {
        headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=3600" },
    });
}