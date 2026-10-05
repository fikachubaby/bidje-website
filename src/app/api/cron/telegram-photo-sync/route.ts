import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import {
    attachPendingPhotosForCode,
    matchUncodedPhotos,
} from "@/lib/telegram/telegram-photo-matcher";

export const maxDuration = 60;

export async function GET(request: Request) {
    if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const backfill = new URL(request.url).searchParams.get("backfill") === "1";
    const deadline = Date.now() + 45_000;

    // 1. Give a code to photos that have none, using their position next to a details post.
    const matched = await matchUncodedPhotos(
        backfill
            ? { propertyLimit: 2000, includeResolved: true, onlyEmptyProperties: true }
            : { propertyLimit: 400 }
    );

    // 2. Upload every coded photo whose property exists.
    const { data: rows } = await supabaseAdmin
        .from("telegram_pending_photos")
        .select("telegram_code")
        .eq("resolved", false)
        .eq("needs_manual_review", false)
        .not("telegram_code", "is", null)
        .order("created_at", { ascending: true })
        .limit(1000);

    const codes = [...new Set((rows ?? []).map((r) => r.telegram_code as string))];
    const orphanCodes: string[] = [];
    let attached = 0;

    for (const code of codes) {
        if (Date.now() > deadline) break;
        const { data: prop } = await supabaseAdmin
            .from("properties").select("id").eq("telegram_code", code).maybeSingle();
        if (!prop) { orphanCodes.push(code); continue; }
        attached += await attachPendingPhotosForCode(prop.id, code, deadline);
    }

    // 3. Only flag for manual review what is still unmatched after an hour.
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    await supabaseAdmin
        .from("telegram_pending_photos")
        .update({ needs_manual_review: true })
        .eq("resolved", false)
        .is("telegram_code", null)
        .eq("needs_manual_review", false)
        .lt("created_at", hourAgo);

    if (orphanCodes.length > 0) {
        await supabaseAdmin
            .from("telegram_pending_photos")
            .update({ needs_manual_review: true })
            .eq("resolved", false)
            .in("telegram_code", orphanCodes)
            .lt("created_at", hourAgo);
    }

    const { count: remaining } = await supabaseAdmin
        .from("telegram_pending_photos")
        .select("id", { count: "exact", head: true })
        .eq("resolved", false)
        .eq("needs_manual_review", false)
        .not("telegram_code", "is", null);

    return NextResponse.json({
        ok: true,
        backfill,
        propertiesMatchedByPosition: matched.length,
        attached,
        remaining: remaining ?? 0,
    });
}
