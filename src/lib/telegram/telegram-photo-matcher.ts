import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { uploadTelegramPhotoToStorage } from "@/lib/telegram/telegram-bot";

interface Boundary {
    propertyId: string;
    code: string;
    endId: number;
}

export interface MatchOptions {
    chatId?: string;
    propertyLimit?: number;
    maxGap?: number;
    onlyEmptyProperties?: boolean;
    includeResolved?: boolean;
}

function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

/**
 * Upload every unresolved photo carrying this code.
 * A row is marked resolved only AFTER its upload succeeds, so a timeout
 * never loses a photo; the next run simply retries it.
 */
export async function attachPendingPhotosForCode(
    propertyId: string,
    code: string,
    deadline?: number
): Promise<number> {
    const { data: rows, error } = await supabaseAdmin
        .from("telegram_pending_photos")
        .select("id, file_id")
        .eq("telegram_code", code)
        .eq("resolved", false)
        .order("message_id", { ascending: true });

    if (error) {
        console.error(`[telegram-photos] load failed for code ${code}:`, error);
        return 0;
    }

    let attached = 0;
    for (const row of rows ?? []) {
        if (deadline && Date.now() > deadline) break;
        try {
            await uploadTelegramPhotoToStorage(propertyId, row.file_id);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (!/duplicate key|23505/i.test(msg)) {
                console.error(`[telegram-photos] attach failed (photo ${row.id}, code ${code}):`, err);
                continue;
            }
        }
        await supabaseAdmin
            .from("telegram_pending_photos")
            .update({ resolved: true, needs_manual_review: false })
            .eq("id", row.id);
        attached++;
    }
    return attached;
}

/**
 * Give a code to photos that have none, based on position in the chat:
 * a photo belongs to the first property whose post comes AFTER it.
 * Returns the properties that received photos (the caller then attaches them).
 */
export async function matchUncodedPhotos(opts: MatchOptions = {}): Promise<{ propertyId: string; code: string }[]> {
    const {
        chatId,
        propertyLimit = 150,
        maxGap = 100,
        onlyEmptyProperties = false,
        includeResolved = false,
    } = opts;

    let photoQuery = supabaseAdmin
        .from("telegram_pending_photos")
        .select("id, message_id, media_group_id")
        .is("telegram_code", null)
        .order("message_id", { ascending: true })
        .limit(1000);
    if (!includeResolved) photoQuery = photoQuery.eq("resolved", false);
    if (chatId) photoQuery = photoQuery.eq("chat_id", chatId);

    const { data: photos } = await photoQuery;
    if (!photos?.length) return [];

    // Properties that were created from Telegram posts (website-posted ones are bot messages, not boundaries).
    const { data: props } = await supabaseAdmin
        .from("properties")
        .select("id, telegram_code, telegram_message_ids")
        .not("telegram_code", "is", null)
        .not("telegram_message_ids", "is", null)
        .or("sync_origin.is.null,sync_origin.neq.website")
        .order("created_at", { ascending: false })
        .limit(propertyLimit);

    const boundaries: Boundary[] = [];
    for (const p of props ?? []) {
        const ids = (p.telegram_message_ids as number[] | null) ?? [];
        if (ids.length === 0) continue;
        boundaries.push({
            propertyId: p.id,
            code: p.telegram_code as string,
            endId: Math.max(...ids.map(Number)),
        });
    }
    boundaries.sort((a, b) => a.endId - b.endId);
    if (boundaries.length === 0) return [];

    // An album = one unit (all its photos go to the same property).
    const groups = new Map<string, { ids: string[]; endId: number }>();
    for (const p of photos) {
        const key = p.media_group_id ?? `single-${p.id}`;
        const g = groups.get(key) ?? { ids: [], endId: 0 };
        g.ids.push(p.id);
        g.endId = Math.max(g.endId, Number(p.message_id));
        groups.set(key, g);
    }

    const matches = new Map<string, { boundary: Boundary; photoIds: string[] }>();
    for (const g of groups.values()) {
        const b = boundaries.find((x) => x.endId > g.endId);
        if (!b || b.endId - g.endId > maxGap) continue; // details post not here yet
        const m = matches.get(b.propertyId) ?? { boundary: b, photoIds: [] };
        m.photoIds.push(...g.ids);
        matches.set(b.propertyId, m);
    }
    if (matches.size === 0) return [];

    if (onlyEmptyProperties) {
        for (const ids of chunk([...matches.keys()], 100)) {
            const { data } = await supabaseAdmin
                .from("property_images")
                .select("property_id")
                .in("property_id", ids);
            for (const r of data ?? []) matches.delete(r.property_id);
        }
    }

    // Claim: write the code onto the photos (only rows still without a code).
    const result: { propertyId: string; code: string }[] = [];
    for (const { boundary, photoIds } of matches.values()) {
        for (const ids of chunk(photoIds, 100)) {
            const { error } = await supabaseAdmin
                .from("telegram_pending_photos")
                .update({ telegram_code: boundary.code, needs_manual_review: false, resolved: false })
                .in("id", ids)
                .is("telegram_code", null);
            if (error) console.error("[telegram-photos] claim failed:", error);
        }
        result.push({ propertyId: boundary.propertyId, code: boundary.code });
    }
    return result;
}

/** Match uncoded photos by position, then upload them. */
export async function matchAndAttachUncodedPhotos(
    opts: MatchOptions & { deadline?: number } = {}
): Promise<{ matched: number; attached: number }> {
    const pairs = await matchUncodedPhotos(opts);
    let attached = 0;
    for (const p of pairs) {
        if (opts.deadline && Date.now() > opts.deadline) break;
        attached += await attachPendingPhotosForCode(p.propertyId, p.code, opts.deadline);
    }
    return { matched: pairs.length, attached };
}
