import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { uploadTelegramPhotoToStorage } from "@/lib/telegram/telegram-bot";

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: pending } = await supabaseAdmin
        .from("telegram_pending_photos")
        .select("id, media_group_id, file_id, telegram_code, created_at")
        .eq("resolved", false)
        .order("created_at", { ascending: true })
        .limit(200);

    if (!pending || pending.length === 0) {
        return NextResponse.json({ ok: true, processed: 0 });
    }

    const codeByGroup = new Map<string, string>();
    for (const row of pending) {
        if (row.media_group_id && row.telegram_code) {
            codeByGroup.set(row.media_group_id, row.telegram_code);
        }
    }
    const uncoded = pending.filter((r) => !r.telegram_code && r.media_group_id && codeByGroup.has(r.media_group_id));
    for (const row of uncoded) {
        const code = codeByGroup.get(row.media_group_id!)!;
        await supabaseAdmin
            .from("telegram_pending_photos")
            .update({ telegram_code: code })
            .eq("id", row.id);
        row.telegram_code = code;
    }

    const byCode = new Map<string, typeof pending>();
    for (const row of pending) {
        if (!row.telegram_code) continue;
        if (!byCode.has(row.telegram_code)) byCode.set(row.telegram_code, []);
        byCode.get(row.telegram_code)!.push(row);
    }

    let processed = 0;

    for (const [code, photos] of byCode) {
        const { data: property } = await supabaseAdmin
            .from("properties")
            .select("id")
            .eq("telegram_code", code)
            .maybeSingle();

        if (!property) {
            const ids = photos.map((p) => p.id);
            await supabaseAdmin
                .from("telegram_pending_photos")
                .update({ needs_manual_review: true })
                .in("id", ids);
            console.warn(`Cron: no property found for code ${code}, flagged ${ids.length} photo(s) for review.`);
            continue;
        }

        const { count: existingCount } = await supabaseAdmin
            .from("property_images")
            .select("id", { count: "exact", head: true })
            .eq("property_id", property.id);

        let order = existingCount ?? 0;
        for (const photo of photos) {
            try {
                await uploadTelegramPhotoToStorage(property.id, photo.file_id, order);
                await supabaseAdmin
                    .from("telegram_pending_photos")
                    .update({ resolved: true })
                    .eq("id", photo.id);
                order += 1;
                processed += 1;
            } catch (err) {
                console.error(`Cron: failed to flush photo ${photo.id} (code ${code}):`, err);
            }
        }
    }

    // Flag anything that's been sitting unresolved with no code at all for
    // over an hour — likely an orphaned photo whose details message never
    // arrived, or arrived with a mismatched/mistyped code.
    await supabaseAdmin
        .from("telegram_pending_photos")
        .update({ needs_manual_review: true })
        .eq("resolved", false)
        .is("telegram_code", null)
        .eq("needs_manual_review", false)
        .lt("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

    await supabaseAdmin
        .from("telegram_pending_photos")
        .delete()
        .eq("resolved", false)
        .eq("needs_manual_review", false)
        .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    return NextResponse.json({ ok: true, processed });
}