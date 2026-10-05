import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import {
    detectPropertyCode,
    extractFieldsFromText,
} from "@/lib/telegram/telegram-import";
import {
    attachPendingPhotosForCode,
    matchAndAttachUncodedPhotos,
} from "@/lib/telegram/telegram-photo-matcher";

export const maxDuration = 60; // albums mean many downloads

interface TelegramUpdate {
    message?: TgMessage;
    edited_message?: TgMessage;
    channel_post?: TgMessage;
    edited_channel_post?: TgMessage;
}

interface TgMessage {
    message_id: number;
    chat: { id: number };
    from?: { id: number };
    sender_chat?: { id: number };
    text?: string;
    caption?: string;
    media_group_id?: string;
    photo?: { file_id: string }[];
}

const ALLOWED_SENDER_IDS = new Set(
    (process.env.TELEGRAM_ALLOWED_SENDER_IDS ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
);

export async function POST(request: Request) {
    try {
        const secretHeader = request.headers.get("x-telegram-bot-api-secret-token");
        if (secretHeader !== process.env.TELEGRAM_WEBHOOK_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const update: TelegramUpdate = await request.json();
        const msg =
            update.message ?? update.edited_message ?? update.channel_post ?? update.edited_channel_post;

        if (!msg) {
            return NextResponse.json({ ok: true });
        }

        const isEdit = Boolean(update.edited_message || update.edited_channel_post);

        const expectedChatId = process.env.TELEGRAM_GROUP_CHAT_ID;
        if (String(msg.chat.id) !== expectedChatId) {
            console.warn(`[telegram-webhook] Chat ID mismatch: got ${msg.chat.id}, expected ${expectedChatId}`);
            return NextResponse.json({ ok: true });
        }

        const senderId = msg.from?.id
            ? String(msg.from.id)
            : msg.sender_chat?.id
                ? String(msg.sender_chat.id)
                : null;

        if (!senderId || !ALLOWED_SENDER_IDS.has(senderId)) {
            console.warn(`[telegram-webhook] Rejected message from unlisted sender: ${senderId ?? "unknown"}`);
            return NextResponse.json({ ok: true });
        }

        const text = msg.caption ?? msg.text ?? "";
        const code = text ? detectPropertyCode(text) : null;

        // ---------- PHOTOS ----------
        if (msg.photo && msg.photo.length > 0) {
            const largest = msg.photo[msg.photo.length - 1];
            const mediaGroupId = msg.media_group_id ?? null;

            // Album photos without a caption borrow the code from a sibling.
            const photoCode = code ?? (await findGroupCode(mediaGroupId));

            await bufferIncomingPhoto({
                fileId: largest.file_id,
                messageId: msg.message_id,
                chatId: String(msg.chat.id),
                mediaGroupId,
                code: photoCode,
            });

            if (photoCode) {
                if (mediaGroupId) await backfillGroupCode(photoCode, mediaGroupId);

                // Property already exists? Attach right away.
                // If not, the photo waits and is attached when the details post creates the property.
                const { data: prop } = await supabaseAdmin
                    .from("properties")
                    .select("id")
                    .eq("telegram_code", photoCode)
                    .maybeSingle();
                if (prop) await attachPendingPhotosForCode(prop.id, photoCode);
            } else {
                // Photo has no code (the client posts details after the photos).
                // If its details post is already saved (out-of-order delivery),
                // match by position now.
                await matchAndAttachUncodedPhotos({
                    chatId: String(msg.chat.id),
                    deadline: Date.now() + 40_000,
                });
            }

            if (!code) {
                return NextResponse.json({
                    ok: true,
                    action: photoCode ? "photo-attached-or-waiting" : "photo-buffered",
                });
            }
        }

        // ---------- TEXT / DETAILS ----------
        if (!text.trim() && !msg.photo) {
            return NextResponse.json({ ok: true });
        }

        if (!code) {
            return NextResponse.json({ ok: true });
        }

        const soldMatch = /^\[(SOLD|ARCHIVED)\]/i.exec(text.trim());
        const isDetailsMessage = text.includes("Property Details");

        if (!isDetailsMessage && (!msg.photo || msg.photo.length === 0)) {
            return NextResponse.json({ ok: true, code, action: "ignored-no-details" });
        }

        const { data: existingRow } = await supabaseAdmin
            .from("properties")
            .select(
                "id, telegram_message_ids, telegram_chat_id, telegram_has_caption, sync_origin, status, title, asking_price, full_address, state, district, property_type, tenure, bumi_status, land_size, built_up_size, bedrooms, bathrooms, description, google_maps_url, internal_notes"
            )
            .eq("telegram_code", code)
            .maybeSingle();

        if (soldMatch && existingRow) {
            const newStatus = soldMatch[1].toUpperCase() === "SOLD" ? "Sold" : "Archived";
            const { error } = await supabaseAdmin
                .from("properties")
                .update({ status: newStatus })
                .eq("id", existingRow.id);
            if (error) {
                console.error(`[telegram-webhook] status-update failed for code ${code}:`, error);
                return NextResponse.json({ ok: true, code, action: "status-update-failed" });
            }
            return NextResponse.json({ ok: true, code, action: "status-updated" });
        }

        if (!isDetailsMessage) {
            return NextResponse.json({ ok: true, code, action: "photo-only-skipped" });
        }

        if (
            existingRow?.sync_origin === "website" &&
            existingRow.telegram_message_ids?.includes(msg.message_id)
        ) {
            return NextResponse.json({ ok: true });
        }

        const fields = extractFieldsFromText(text, code);

        const ALLOWED_TENURE = ["Freehold", "Leasehold"];
        const tenureValue = fields.tenure || existingRow?.tenure || "Leasehold";
        const safeTenure = ALLOWED_TENURE.includes(tenureValue) ? tenureValue : "Leasehold";

        const isPhotoMessage = Boolean(msg.photo && msg.photo.length > 0);
        const messageIdsForUpdate = isPhotoMessage
            ? await collectAlbumMessageIds(msg.message_id, msg.media_group_id ?? null)
            : existingRow?.telegram_message_ids ?? [msg.message_id];
        const hasCaptionForUpdate = isPhotoMessage
            ? true
            : existingRow?.telegram_has_caption ?? false;
        const chatIdForUpdate = isPhotoMessage || !existingRow
            ? String(msg.chat.id)
            : existingRow.telegram_chat_id ?? String(msg.chat.id);

        const propertyPayload = {
            title: fields.title || existingRow?.title || `Property ${code}`,
            asking_price: fields.price ?? existingRow?.asking_price ?? 0,
            full_address: fields.address || existingRow?.full_address || "Address Pending",
            state: fields.state || existingRow?.state || "Unknown",
            district: fields.district || existingRow?.district || null,
            property_type: fields.propertyType || existingRow?.property_type || "Residential",
            tenure: safeTenure,
            bumi_status: ["Bumi", "Non Bumi"].includes(fields.bumiStatus)
                ? fields.bumiStatus
                : existingRow?.bumi_status || "Unknown",
            land_size: fields.landSize || existingRow?.land_size || null,
            built_up_size: fields.builtUp || existingRow?.built_up_size || null,
            bedrooms: fields.bedrooms ?? existingRow?.bedrooms ?? null,
            bathrooms: fields.bathrooms ?? existingRow?.bathrooms ?? null,
            description: fields.description || existingRow?.description || null,
            google_maps_url: fields.mapsUrl || existingRow?.google_maps_url || null,
            is_address_hidden: true,
            telegram_code: code,
            telegram_chat_id: chatIdForUpdate,
            telegram_message_ids: messageIdsForUpdate,
            telegram_has_caption: hasCaptionForUpdate,
            telegram_sender_id: senderId,
            telegram_last_synced_at: new Date().toISOString(),
            internal_notes: fields.internalNotes || existingRow?.internal_notes || null,
        };

        let propertyId: string;

        if (existingRow) {
            const { error } = await supabaseAdmin
                .from("properties")
                .update(propertyPayload)
                .eq("id", existingRow.id);
            if (error) {
                console.error(`[telegram-webhook] update failed for code ${code}:`, error);
                return NextResponse.json({ ok: true, code, action: "update-failed", error: error.message });
            }
            propertyId = existingRow.id;
        } else {
            const { data: upserted, error } = await supabaseAdmin
                .from("properties")
                .upsert(
                    { ...propertyPayload, status: "Published" },
                    { onConflict: "telegram_code" }
                )
                .select("id")
                .single();
            if (error) {
                console.error(`[telegram-webhook] insert/upsert failed for code ${code}:`, error);
                return NextResponse.json({ ok: true, code, action: "insert-failed", error: error.message });
            }
            propertyId = upserted.id;
        }

        // 1. Photos that already carry this code (album with a captioned photo).
        if (msg.media_group_id) await backfillGroupCode(code, msg.media_group_id);
        await attachPendingPhotosForCode(propertyId, code);

        // 2. Photos with no code: the client posts photos first, then details,
        //    so match the uncoded photos sitting just before this details post.
        await matchAndAttachUncodedPhotos({
            chatId: String(msg.chat.id),
            deadline: Date.now() + 45_000,
        });

        return NextResponse.json({ ok: true, code, action: existingRow ? "updated" : "created", isEdit, propertyId });
    } catch (err) {
        console.error("[telegram-webhook] UNCAUGHT ERROR:", err);
        return NextResponse.json({ ok: true, action: "error-logged" });
    }
}

/** Save a photo reference. Idempotent, so Telegram retries and edits don't duplicate rows. */
async function bufferIncomingPhoto(params: {
    fileId: string;
    messageId: number;
    chatId: string;
    mediaGroupId: string | null;
    code: string | null;
}) {
    const { fileId, messageId, chatId, mediaGroupId, code } = params;

    const { error } = await supabaseAdmin.from("telegram_pending_photos").upsert(
        {
            media_group_id: mediaGroupId,
            message_id: messageId,
            file_id: fileId,
            chat_id: chatId,
            telegram_code: code,
            resolved: false,
            needs_manual_review: false,
        },
        { onConflict: "chat_id,message_id", ignoreDuplicates: true }
    );

    if (error) {
        console.error(`[telegram-webhook] failed to buffer photo (message ${messageId}):`, error);
    }
}

/** Find a code already known for this album (from its captioned photo). */
async function findGroupCode(mediaGroupId: string | null): Promise<string | null> {
    if (!mediaGroupId) return null;
    const { data } = await supabaseAdmin
        .from("telegram_pending_photos")
        .select("telegram_code")
        .eq("media_group_id", mediaGroupId)
        .not("telegram_code", "is", null)
        .limit(1)
        .maybeSingle();
    return data?.telegram_code ?? null;
}

/** Copy the code onto uncoded siblings of the same album. Never marks anything resolved. */
async function backfillGroupCode(code: string, mediaGroupId: string) {
    const { error } = await supabaseAdmin
        .from("telegram_pending_photos")
        .update({ telegram_code: code })
        .eq("media_group_id", mediaGroupId)
        .is("telegram_code", null)
        .eq("resolved", false);
    if (error) {
        console.error(`[telegram-webhook] backfill failed for group ${mediaGroupId}:`, error);
    }
}

/**
 * For an album, collect the message IDs of all its photo messages so
 * telegram_message_ids reflects the whole album, not just the caption message.
 */
async function collectAlbumMessageIds(
    captionMessageId: number,
    mediaGroupId: string | null
): Promise<number[]> {
    if (!mediaGroupId) return [captionMessageId];

    const { data: siblings, error } = await supabaseAdmin
        .from("telegram_pending_photos")
        .select("message_id")
        .eq("media_group_id", mediaGroupId);

    if (error) {
        console.error(`[telegram-webhook] failed to collect album siblings for group ${mediaGroupId}:`, error);
        return [captionMessageId];
    }

    const ids = new Set<number>([captionMessageId, ...(siblings ?? []).map((s) => s.message_id)]);
    return Array.from(ids).sort((a, b) => a - b);
}
