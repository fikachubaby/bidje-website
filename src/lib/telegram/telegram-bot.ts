import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
const TELEGRAM_FILE_BASE = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}`;

interface SendMediaGroupResult {
    messageIds: number[];
    hasCaption: boolean;
}

async function tgFetch(method: string, body: Record<string, unknown>) {
    const res = await fetch(`${TELEGRAM_API}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) {
        if (data.description?.includes("message is not modified")) {
            return null;
        }
        throw new Error(`Telegram API ${method} failed: ${data.description}`);
    }
    return data.result;
}

const CONTACT_FOOTER = [
    `Note ## : For privacy concern please contact us for more pictures and details`,
    ``,
    `Interested to buy property for your future? Contact us now!`,
    `+60137098606 (Fikri/Ina/Haziq)`,
    `www.dealhartanah.com`,
].join("\n");

/** Build the caption text matching the client's listing template. */
export function buildTelegramCaption(property: {
    telegramCode: string;
    title: string;
    fullAddress: string;
    mapsUrl?: string | null;
    propertyType: string;
    tenure: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
    builtUpSize?: string | null;
    landSize?: string | null;
    askingPrice: number;
    description?: string | null;
}): string {
    const lines = [
        `Code: ${property.telegramCode}`,
        property.title,
        `Property Details:`,
        `Full Address : ${property.fullAddress}`,
    ];
    if (property.mapsUrl) lines.push(`Location : ${property.mapsUrl}`);
    lines.push(
        `Type : ${property.propertyType}`,
        `Tenure : ${property.tenure}`,
        `Room : ${property.bedrooms ?? ""}`,
        `Bathroom : ${property.bathrooms ?? ""}`,
    );
    if (property.builtUpSize) lines.push(`Built up : ${property.builtUpSize}`);
    if (property.landSize) lines.push(`Land Area : ${property.landSize}`);
    lines.push(`PRICE : RM${property.askingPrice.toLocaleString()}`);

    const trimmedDescription = property.description?.trim();
    if (trimmedDescription) {
        lines.push(``, trimmedDescription);
    }

    lines.push(``, CONTACT_FOOTER);

    return lines.join("\n");
}

/** Post a brand-new listing (with photos) into the group. */
export async function postNewListing(
    caption: string,
    photoUrls: string[]
): Promise<SendMediaGroupResult> {
    const chatId = process.env.TELEGRAM_GROUP_CHAT_ID;
    if (photoUrls.length === 0) {
        const result = await tgFetch("sendMessage", { chat_id: chatId, text: caption });
        return { messageIds: [result.message_id], hasCaption: false };
    }

    const media = photoUrls.map((url, i) => ({
        type: "photo",
        media: url,
        ...(i === 0 ? { caption } : {}),
    }));

    const result = await tgFetch("sendMediaGroup", { chat_id: chatId, media });

    return {
        messageIds: result.map((m: { message_id: number }) => m.message_id),
        hasCaption: true,
    };
}

/** Edit an existing listing's text (photo caption or plain text). */
export async function editListingCaption(
    messageId: number,
    caption: string,
    hasCaption: boolean
) {
    const chatId = process.env.TELEGRAM_GROUP_CHAT_ID;
    if (hasCaption) {
        await tgFetch("editMessageCaption", {
            chat_id: chatId,
            message_id: messageId,
            caption,
        });
    } else {
        await tgFetch("editMessageText", {
            chat_id: chatId,
            message_id: messageId,
            text: caption,
        });
    }
}

/** Mark a listing as sold/archived by editing its caption. */
export async function markListingStatus(
    messageId: number,
    currentCaption: string,
    status: string,
    hasCaption: boolean
) {
    await editListingCaption(messageId, `[${status.toUpperCase()}]\n\n${currentCaption}`, hasCaption);
}

export function generateTelegramCode(propertyId: string): string {
    return `WEB-${propertyId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

interface SyncableProperty {
    id: string;
    status?: string | null;
    telegramCode: string | null;
    telegramChatId: string | null;
    telegramMessageIds: number[] | null;
    telegramHasCaption?: boolean | null;
    title: string;
    fullAddress: string;
    mapsUrl?: string | null;
    propertyType: string;
    tenure: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
    builtUpSize?: string | null;
    landSize?: string | null;
    askingPrice: number;
    description?: string | null;
}

/**
 * Post a website-created property to the Telegram group ONCE.
 * If the property is already in Telegram (imported from the group, or posted
 * earlier), do nothing: later photo/detail edits on the website never repost.
 * Never throws; Telegram is secondary and must not fail the property save.
 */
export async function syncPropertyToTelegram(
    property: SyncableProperty,
    photoUrls: string[]
): Promise<void> {
    if (property.status && property.status !== "Published") {
        return;
    }

    // Already in the group: imported from Telegram (client's own code,
    // not WEB-...) or already posted from the website (has message ids).
    const alreadyInTelegram =
        !!property.telegramMessageIds?.length ||
        (!!property.telegramCode && !property.telegramCode.startsWith("WEB-"));
    if (alreadyInTelegram) {
        return;
    }

    try {
        const code = property.telegramCode || generateTelegramCode(property.id);
        const caption = buildTelegramCaption({
            telegramCode: code,
            title: property.title,
            fullAddress: property.fullAddress,
            mapsUrl: property.mapsUrl,
            propertyType: property.propertyType,
            tenure: property.tenure,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            builtUpSize: property.builtUpSize,
            landSize: property.landSize,
            askingPrice: property.askingPrice,
            description: property.description,
        });

        const result = await postNewListing(caption, photoUrls);

        const { error: updateError } = await supabaseAdmin
            .from("properties")
            .update({
                telegram_code: code,
                telegram_chat_id: process.env.TELEGRAM_GROUP_CHAT_ID,
                telegram_message_ids: result.messageIds,
                telegram_has_caption: result.hasCaption,
                telegram_last_synced_at: new Date().toISOString(),
                sync_origin: "website",
            })
            .eq("id", property.id);

        if (updateError) {
            console.error(`Failed to persist Telegram sync state for property ${property.id}:`, updateError);
        }
    } catch (err) {
        console.error(`Telegram sync failed for property ${property.id}:`, err);
    }
}

/** Delete one or more messages. */
export async function deleteMessages(messageIds: number[]): Promise<void> {
    const chatId = process.env.TELEGRAM_GROUP_CHAT_ID;
    for (const messageId of messageIds) {
        try {
            await tgFetch("deleteMessage", { chat_id: chatId, message_id: messageId });
        } catch (err) {
            console.error(`Failed to delete Telegram message ${messageId}:`, err);
        }
    }
}

/** Fetch Telegram's internal file_path for a file_id, then download the raw bytes. */
export async function downloadTelegramPhoto(fileId: string): Promise<Buffer> {
    const fileRes = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
    const fileData = await fileRes.json();
    if (!fileData.ok) {
        throw new Error(`Telegram getFile failed: ${fileData.description}`);
    }
    const filePath = fileData.result.file_path;
    const bytesRes = await fetch(`${TELEGRAM_FILE_BASE}/${filePath}`);
    if (!bytesRes.ok) {
        throw new Error(`Telegram file download failed: ${bytesRes.status}`);
    }
    return Buffer.from(await bytesRes.arrayBuffer());
}

/** Make sure the property has exactly one cover image (unique index safe). */
async function ensureCover(propertyId: string) {
    const { data: cover } = await supabaseAdmin
        .from("property_images")
        .select("id")
        .eq("property_id", propertyId)
        .eq("is_cover", true)
        .limit(1)
        .maybeSingle();
    if (cover) return;

    const { data: first } = await supabaseAdmin
        .from("property_images")
        .select("id")
        .eq("property_id", propertyId)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (first) {
        // If a concurrent call already set a cover, the unique index rejects this; ignore.
        await supabaseAdmin.from("property_images").update({ is_cover: true }).eq("id", first.id);
    }
}

/**
 * Download a Telegram photo, upload it to Supabase Storage, and add it to
 * property_images. Safe to call twice for the same photo.
 * The third argument is kept only so existing callers (e.g. the admin
 * "resolve" route) still compile; it is ignored, order is computed here.
 */
export async function uploadTelegramPhotoToStorage(
    propertyId: string,
    fileId: string,
    _displayOrder?: number
): Promise<string> {
    const bytes = await downloadTelegramPhoto(fileId);
    const path = `properties/${propertyId}/${fileId}.jpg`;

    const { error: uploadError } = await supabaseAdmin.storage
        .from("property-images")
        .upload(path, bytes, { contentType: "image/jpeg", upsert: true });
    if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabaseAdmin.storage
        .from("property-images")
        .getPublicUrl(path);
    const publicUrl = publicUrlData.publicUrl;

    const { data: existing } = await supabaseAdmin
        .from("property_images")
        .select("id")
        .eq("property_id", propertyId)
        .eq("image_url", publicUrl)
        .maybeSingle();
    if (existing) return publicUrl;

    const { data: last } = await supabaseAdmin
        .from("property_images")
        .select("display_order")
        .eq("property_id", propertyId)
        .order("display_order", { ascending: false })
        .limit(1)
        .maybeSingle();

    const { error: insertError } = await supabaseAdmin.from("property_images").insert({
        property_id: propertyId,
        image_url: publicUrl,
        display_order: (last?.display_order ?? -1) + 1,
        is_cover: false,
    });
    if (insertError) {
        throw new Error(`property_images insert failed: ${insertError.message}`);
    }

    await ensureCover(propertyId);
    return publicUrl;
}

/**
 * Attach every unresolved buffered photo that carries this code to the property.
 * Each row is claimed atomically first, so concurrent webhooks never double-process it.
 */
export async function attachPendingPhotosForCode(propertyId: string, code: string): Promise<void> {
    const { data: rows, error } = await supabaseAdmin
        .from("telegram_pending_photos")
        .select("id, file_id")
        .eq("telegram_code", code)
        .eq("resolved", false)
        .order("message_id", { ascending: true });

    if (error) {
        console.error(`Failed to load pending photos for code ${code}:`, error);
        return;
    }

    for (const row of rows ?? []) {
        const { data: claimed } = await supabaseAdmin
            .from("telegram_pending_photos")
            .update({ resolved: true, needs_manual_review: false })
            .eq("id", row.id)
            .eq("resolved", false)
            .select("id");
        if (!claimed?.length) continue;

        try {
            await uploadTelegramPhotoToStorage(propertyId, row.file_id);
        } catch (err) {
            console.error(`Attach failed for pending photo ${row.id}:`, err);
            // Release it so it shows up in the manual review box.
            await supabaseAdmin
                .from("telegram_pending_photos")
                .update({ resolved: false })
                .eq("id", row.id);
        }
    }
}

/**
 * Safely extracts a Google Maps URL from a raw Telegram post text.
 */
export function extractGoogleMapsUrl(text: string): string | null {
    if (!text) return null;
    const match = text.match(/https?:\/\/(?:maps\.google\.com|maps\.app\.goo\.gl|goo\.gl\/maps|share\.google|(?:www\.)?google\.com\/maps)[^\s\n]+/i);
    return match ? match[0].trim() : null;
}

/** Send a simple notification text message to the configured Telegram chat/group. */
export async function sendTelegramNotification(text: string): Promise<void> {
    const chatId = process.env.TELEGRAM_GROUP_CHAT_ID;
    if (!chatId) {
        console.warn("TELEGRAM_GROUP_CHAT_ID is not configured.");
        return;
    }
    await tgFetch("sendMessage", {
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
    });
}
