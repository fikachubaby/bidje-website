import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import {
    detectPropertyCode,
    extractFieldsFromText,
} from "@/lib/telegram/telegram-import";
import { uploadTelegramPhotoToStorage } from "@/lib/telegram/telegram-bot";

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

    if (msg.photo && msg.photo.length > 0) {
        const largest = msg.photo[msg.photo.length - 1];
        await handleIncomingPhoto({
            fileId: largest.file_id,
            messageId: msg.message_id,
            chatId: String(msg.chat.id),
            mediaGroupId: msg.media_group_id ?? null,
            code,
        });

        if (!code) {
            return NextResponse.json({ ok: true, action: "photo-buffered" });
        }
    }

    if (!text.trim() && !msg.photo) {
        return NextResponse.json({ ok: true });
    }

    if (!code) {
        return NextResponse.json({ ok: true });
    }

    const soldMatch = /^\[(SOLD|ARCHIVED)\]/i.exec(text.trim());

    const { data: existingRow } = await supabaseAdmin
        .from("properties")
        .select("id, telegram_message_ids, sync_origin, status")
        .eq("telegram_code", code)
        .maybeSingle();

    if (soldMatch && existingRow) {
        const newStatus = soldMatch[1].toUpperCase() === "SOLD" ? "Sold" : "Archived";
        const { error } = await supabaseAdmin
            .from("properties")
            .update({ status: newStatus })
            .eq("id", existingRow.id);
        if (error) throw error;
        return NextResponse.json({ ok: true, code, action: "status-updated" });
    }

    const isDetailsMessage = !msg.photo || msg.photo.length === 0 || text.includes("Property Details");
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

    const propertyPayload = {
        title: fields.title,
        asking_price: fields.price ?? 0,
        full_address: fields.address || "Address Pending",
        state: fields.state || "Unknown",
        district: fields.district || null,
        property_type: fields.propertyType || "Residential",
        tenure: fields.tenure === "Freehold" ? "Freehold" : "Leasehold",
        bumi_status: ["Bumi", "Non Bumi"].includes(fields.bumiStatus) ? fields.bumiStatus : "Unknown",
        land_size: fields.landSize || null,
        built_up_size: fields.builtUp || null,
        bedrooms: fields.bedrooms,
        bathrooms: fields.bathrooms,
        description: fields.description || null,
        google_maps_url: fields.mapsUrl || null,
        telegram_code: code,
        telegram_chat_id: String(msg.chat.id),
        telegram_message_ids: [msg.message_id],
        telegram_sender_id: senderId,
        telegram_last_synced_at: new Date().toISOString(),
        ...(existingRow ? {} : { status: "Draft" }),
    };

    let propertyId: string;
    if (existingRow) {
        const { error } = await supabaseAdmin
            .from("properties")
            .update(propertyPayload)
            .eq("id", existingRow.id);
        if (error) throw error;
        propertyId = existingRow.id;
    } else {
        const { data: inserted, error } = await supabaseAdmin
            .from("properties")
            .insert(propertyPayload)
            .select("id")
            .single();
        if (error) throw error;
        propertyId = inserted.id;
    }

    await flushPendingPhotosForCode(code, propertyId);

    return NextResponse.json({ ok: true, code, action: existingRow ? "updated" : "created", isEdit });
}

/**
 * Store or immediately process an incoming photo, now keyed reliably by code.
 */
async function handleIncomingPhoto(params: {
    fileId: string;
    messageId: number;
    chatId: string;
    mediaGroupId: string | null;
    code: string | null;
}) {
    const { fileId, messageId, chatId, mediaGroupId, code } = params;

    if (code) {
        const { data: property } = await supabaseAdmin
            .from("properties")
            .select("id")
            .eq("telegram_code", code)
            .maybeSingle();

        if (property) {
            const { count } = await supabaseAdmin
                .from("property_images")
                .select("id", { count: "exact", head: true })
                .eq("property_id", property.id);
            await uploadTelegramPhotoToStorage(property.id, fileId, count ?? 0);
            return;
        }
    }

    await supabaseAdmin.from("telegram_pending_photos").insert({
        media_group_id: mediaGroupId,
        message_id: messageId,
        file_id: fileId,
        chat_id: chatId,
        telegram_code: code,
        resolved: false,
    });
}

/** Flush buffered photos strictly matching this code — no more "most recent property" guessing. */
async function flushPendingPhotosForCode(code: string, propertyId: string) {
    const { data: pending } = await supabaseAdmin
        .from("telegram_pending_photos")
        .select("id, file_id")
        .eq("resolved", false)
        .eq("telegram_code", code)
        .order("created_at", { ascending: true });

    if (!pending || pending.length === 0) return;

    const { count: existingCount } = await supabaseAdmin
        .from("property_images")
        .select("id", { count: "exact", head: true })
        .eq("property_id", propertyId);

    let order = existingCount ?? 0;
    for (const photo of pending) {
        try {
            await uploadTelegramPhotoToStorage(propertyId, photo.file_id, order);
            await supabaseAdmin
                .from("telegram_pending_photos")
                .update({ resolved: true })
                .eq("id", photo.id);
            order += 1;
        } catch (err) {
            console.error(`Failed to flush pending photo ${photo.id}:`, err);
        }
    }
}