import { normalizePhone } from "@/lib/phone";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { sendMetaWhatsAppTemplate } from "@/lib/meta-whatsapp";
import { fetchLelongPropertyMatches } from "./lelong-property";
import type { AuctionListing } from "./types";

type DeliveryRow = {
    status: "sent" | "failed";
};

function requiredEnv(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`${name} is not configured`);
    return value;
}

function recipientsFromEnv(): string[] {
    const raw = requiredEnv("AUCTION_ALERT_RECIPIENTS");
    const unique = new Set<string>();

    for (const value of raw.split(",")) {
        const normalized = normalizePhone(value);
        if (normalized) unique.add(normalized);
    }

    if (!unique.size) {
        throw new Error("AUCTION_ALERT_RECIPIENTS contains no valid phone numbers");
    }

    return [...unique];
}

function formatPrice(amount: number): string {
    return `RM ${new Intl.NumberFormat("en-MY", {
        maximumFractionDigits: 0,
    }).format(amount)}`;
}

function formatDate(iso: string | null): string {
    if (!iso) return "Check source";
    const [year, month, day] = iso.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    return new Intl.DateTimeFormat("en-MY", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kuala_Lumpur",
    }).format(date);
}

async function upsertListing(listing: AuctionListing): Promise<number> {
    const { data, error } = await supabaseAdmin
        .from("auction_alert_listings")
        .upsert(
            {
                source: listing.source,
                external_key: listing.externalKey,
                source_url: listing.sourceUrl,
                title: listing.title,
                address: listing.address,
                state: listing.state,
                reserve_price: listing.reservePrice,
                auction_date: listing.auctionDate,
                property_type: listing.propertyType,
                last_seen_at: new Date().toISOString(),
            },
            { onConflict: "source,external_key" }
        )
        .select("id")
        .single();

    if (error || !data?.id) {
        throw new Error(
            `Failed to store auction listing: ${error?.message || "missing id"}`
        );
    }

    return Number(data.id);
}

async function deliveryAlreadySent(
    listingId: number,
    recipient: string
): Promise<boolean> {
    const { data, error } = await supabaseAdmin
        .from("auction_alert_deliveries")
        .select("status")
        .eq("listing_id", listingId)
        .eq("recipient", recipient)
        .maybeSingle<DeliveryRow>();

    if (error) throw new Error(`Failed to read delivery state: ${error.message}`);
    return data?.status === "sent";
}

async function saveDelivery(args: {
    listingId: number;
    recipient: string;
    status: "sent" | "failed";
    providerMessageId?: string | null;
    errorMessage?: string | null;
}) {
    const { error } = await supabaseAdmin
        .from("auction_alert_deliveries")
        .upsert(
            {
                listing_id: args.listingId,
                recipient: args.recipient,
                status: args.status,
                provider_message_id: args.providerMessageId ?? null,
                error_message: args.errorMessage?.slice(0, 1500) ?? null,
                attempted_at: new Date().toISOString(),
                sent_at:
                    args.status === "sent" ? new Date().toISOString() : null,
            },
            { onConflict: "listing_id,recipient" }
        );

    if (error) throw new Error(`Failed to save delivery result: ${error.message}`);
}

export async function runAuctionAlerts() {
    const recipients = recipientsFromEnv();
    const templateName = requiredEnv("META_WHATSAPP_AUCTION_TEMPLATE_NAME");
    const languageCode =
        process.env.META_WHATSAPP_AUCTION_TEMPLATE_LANG?.trim() || "en";

    const source = await fetchLelongPropertyMatches();

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const listing of source.listings) {
        const listingId = await upsertListing(listing);

        for (const recipient of recipients) {
            if (await deliveryAlreadySent(listingId, recipient)) {
                skipped++;
                continue;
            }

            try {
                // Existing approved Meta template `auction_property_alert`:
                // {{1}} Location
                // {{2}} Property type
                // {{3}} Reserve price
                // {{4}} Auction date
                // {{5}} Address
                // {{6}} View details URL
                const result = await sendMetaWhatsAppTemplate({
                    to: recipient,
                    templateName,
                    languageCode,
                    variables: [
                        listing.state,
                        listing.propertyType || listing.title,
                        formatPrice(listing.reservePrice),
                        formatDate(listing.auctionDate),
                        listing.address,
                        listing.sourceUrl,
                    ],
                });

                await saveDelivery({
                    listingId,
                    recipient,
                    status: "sent",
                    providerMessageId: result.messageId,
                });
                sent++;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : String(error);

                await saveDelivery({
                    listingId,
                    recipient,
                    status: "failed",
                    errorMessage: message,
                });
                failed++;
            }
        }
    }

    return {
        source: "lelongproperty",
        pagesFetched: source.pagesFetched,
        sourceErrors: source.errors,
        matches: source.listings.length,
        recipients: recipients.length,
        sent,
        skipped,
        failed,
    };
}
