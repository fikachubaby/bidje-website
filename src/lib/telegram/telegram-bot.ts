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

    // Amenities / Access / Additional Information block, as typed or as
    // captured verbatim from the original Telegram import.
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

/** Edit an existing listing's text — routes to the correct Telegram method
 *  depending on whether the original message was a photo (caption) or plain text. */
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

const CONTACT_FOOTER = [
    `Note ## : For privacy concern please contact us for more pictures and details`,
    ``,
    `Interested to buy property for your future? Contact us now!`,
    `+60137098606 (Fikri/Ina/Haziq)`,
    `www.dealhartanah.com`,
].join("\n");

/**
 * Push a website-side create/update to Telegram, then persist the resulting
 * message id(s) back onto the property row. Never throws Telegram is a
 * secondary system, a failed sync shouldn't fail the property save.
 */
export async function syncPropertyToTelegram(
    property: SyncableProperty,
    photoUrls: string[]
): Promise<void> {
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

        let messageIds = property.telegramMessageIds;
        let hasCaption = property.telegramHasCaption ?? photoUrls.length > 0;

        const previousPhotoCount = property.telegramHasCaption ? (messageIds?.length ?? 0) : 0;
        const photosChanged = previousPhotoCount !== photoUrls.length;

        // Keep the old message ids around only long enough to clean them up
        // *after* a successful repost. Never delete before the new post exists.
        const staleMessageIds = messageIds && messageIds.length > 0 && photosChanged ? messageIds : null;

        if (messageIds && messageIds.length > 0 && !photosChanged) {
            await editListingCaption(messageIds[0], caption, hasCaption);
        } else {
            // Covers both "no existing messages" and "photos changed" cases.
            // Post the new listing FIRST so a failure here never destroys a working one.
            const result = await postNewListing(caption, photoUrls);
            messageIds = result.messageIds;
            hasCaption = result.hasCaption;
        }

        // Persist the new state before attempting any deletion, so a delete
        // failure never leaves the DB pointing at messages we're about to remove.
        const { error: updateError } = await supabaseAdmin
            .from("properties")
            .update({
                telegram_code: code,
                telegram_chat_id: process.env.TELEGRAM_GROUP_CHAT_ID,
                telegram_message_ids: messageIds,
                telegram_has_caption: hasCaption,
                telegram_last_synced_at: new Date().toISOString(),
                sync_origin: "website",
            })
            .eq("id", property.id);

        if (updateError) {
            console.error(`Failed to persist Telegram sync state for property ${property.id}:`, updateError);
            // Don't attempt to delete stale messages if we couldn't confirm the
            // new state was saved — better to leave a duplicate than lose everything.
            return;
        }

        if (staleMessageIds) {
            await deleteMessages(staleMessageIds);
        }
    } catch (err) {
        console.error(`Telegram sync failed for property ${property.id}:`, err);
    }
}

/** Delete one or more messages (used when reposting a listing whose photos changed). */
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

/** Download a Telegram photo and upload it to Supabase Storage under a property's folder. */
export async function uploadTelegramPhotoToStorage(
    propertyId: string,
    fileId: string,
    displayOrder: number
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

    await supabaseAdmin.from("property_images").insert({
        property_id: propertyId,
        image_url: publicUrlData.publicUrl,
        display_order: displayOrder,
        is_cover: displayOrder === 0,
    });

    return publicUrlData.publicUrl;
}

/**
 * Safely extracts a Google Maps URL from a raw Telegram post text.
 * Matches standard Google Maps links (e.g., maps.app.goo.gl, google.com/maps, goo.gl/maps).
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
