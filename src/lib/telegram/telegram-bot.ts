import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

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
}

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
        });

        let messageIds = property.telegramMessageIds;
        let hasCaption = property.telegramHasCaption ?? photoUrls.length > 0;

        if (messageIds && messageIds.length > 0) {
            // Already posted once — edit in place instead of duplicating
            await editListingCaption(messageIds[0], caption, hasCaption);
        } else {
            const result = await postNewListing(caption, photoUrls);
            messageIds = result.messageIds;
            hasCaption = result.hasCaption;
        }

        await supabaseAdmin
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
    } catch (err) {
        console.error(`Telegram sync failed for property ${property.id}:`, err);
    }
}