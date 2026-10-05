import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { uploadTelegramPhotoToStorage } from "@/lib/telegram/telegram-bot";

export const maxDuration = 60;

export async function POST(request: Request) {
    const { pendingPhotoId, propertyId } = await request.json();
    if (!pendingPhotoId || !propertyId) {
        return NextResponse.json({ error: "pendingPhotoId and propertyId required" }, { status: 400 });
    }

    const { data: photo } = await supabaseAdmin
        .from("telegram_pending_photos")
        .select("id, file_id, media_group_id")
        .eq("id", pendingPhotoId)
        .maybeSingle();
    if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

    // Attach the whole album when the photo belongs to one.
    let rows = [photo];
    if (photo.media_group_id) {
        const { data: siblings } = await supabaseAdmin
            .from("telegram_pending_photos")
            .select("id, file_id, media_group_id")
            .eq("media_group_id", photo.media_group_id)
            .eq("resolved", false)
            .order("message_id", { ascending: true });
        if (siblings?.length) rows = siblings;
    }

    let attached = 0;
    for (const row of rows) {
        try {
            await uploadTelegramPhotoToStorage(propertyId, row.file_id);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (!/duplicate key|23505/i.test(msg)) {
                console.error("[telegram-photos] manual attach failed:", err);
                continue;
            }
        }
        await supabaseAdmin
            .from("telegram_pending_photos")
            .update({ resolved: true, needs_manual_review: false })
            .eq("id", row.id);
        attached++;
    }

    if (attached === 0) {
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, attached });
}
