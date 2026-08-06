import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import {
    detectPropertyCode,
    extractFieldsFromText,
} from "@/lib/telegram/telegram-import";

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

    // Only accept from the configured group
    const expectedChatId = process.env.TELEGRAM_GROUP_CHAT_ID;
    if (String(msg.chat.id) !== expectedChatId) {
        return NextResponse.json({ ok: true });
    }

    // Allow-list check filters out other agencies in the shared group
    const senderId = msg.from?.id ? String(msg.from.id) : null;
    if (!senderId || !ALLOWED_SENDER_IDS.has(senderId)) {
        return NextResponse.json({ ok: true });
    }

    const text = msg.caption ?? msg.text ?? "";
    if (!text.trim()) {
        return NextResponse.json({ ok: true });
    }

    const code = detectPropertyCode(text);
    if (!code) {
        return NextResponse.json({ ok: true });
    }

    const { data: existingRow } = await supabaseAdmin
        .from("properties")
        .select("id, telegram_message_ids, sync_origin, status")
        .eq("telegram_code", code)
        .maybeSingle();

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

    if (existingRow) {
        const { error } = await supabaseAdmin
            .from("properties")
            .update(propertyPayload)
            .eq("id", existingRow.id);
        if (error) throw error;
    } else {
        const { error } = await supabaseAdmin.from("properties").insert(propertyPayload);
        if (error) throw error;
    }

    return NextResponse.json({ ok: true, code, action: existingRow ? "updated" : "created", isEdit });
}