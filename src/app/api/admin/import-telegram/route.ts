import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import type { TelegramParsedProperty } from "@/types/telegram-import";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { generateSlug } from "@/lib/utils/property-utils";
import { PROPERTY_STATUSES } from "@/types/property";

export async function POST(request: Request) {
    const { error: authError } = await requireStaffSession();
    if (authError) return authError;

    try {
        const formData = await request.formData();

        const listingsRaw = formData.get("listings");
        if (!listingsRaw || typeof listingsRaw !== "string") {
            return NextResponse.json({ error: "No listings selected for import" }, { status: 400 });
        }

        const listings: TelegramParsedProperty[] = JSON.parse(listingsRaw);
        if (!listings || listings.length === 0) {
            return NextResponse.json({ error: "No listings selected for import" }, { status: 400 });
        }

        const insertedProperties = [];
        const skipped: string[] = [];
        const failed: { telegramCode: string; error: string }[] = [];

        // Skip listings whose telegram code is already saved, so re-uploading the same file is safe.
        const codes = listings.map((l) => l.telegramCode).filter(Boolean);
        const { data: existingRows } = await supabaseAdmin
            .from("properties")
            .select("telegram_code")
            .in("telegram_code", codes);
        const existingCodes = new Set((existingRows ?? []).map((r) => r.telegram_code as string));

        for (const listing of listings) {
            try {
                if (existingCodes.has(listing.telegramCode)) {
                    skipped.push(listing.telegramCode);
                    continue;
                }
                existingCodes.add(listing.telegramCode);

                const title = listing.title || `Telegram Listing ${listing.telegramCode}`;
                const status = PROPERTY_STATUSES.find((s) => s === listing.status) ?? "Draft";
                const toCount = (n: number | null) =>
                    n != null && Number.isFinite(n) ? Math.trunc(n) : null;

                const propertyPayload = {
                    title,
                    slug: generateSlug(title),
                    asking_price: listing.price ?? 0,
                    full_address: listing.address || "Address Pending",
                    state: listing.state || "Unknown",
                    district: listing.district || null,
                    property_type: listing.propertyType || "Residential",
                    tenure: listing.tenure === "Freehold" ? "Freehold" : "Leasehold",
                    bumi_status: ["Bumi", "Non Bumi"].includes(listing.bumiStatus ?? "")
                        ? listing.bumiStatus
                        : "Unknown",
                    land_size: listing.landSize || null,
                    built_up_size: listing.builtUp || null,
                    bedrooms: toCount(listing.bedrooms),
                    bathrooms: toCount(listing.bathrooms),
                    description: listing.description || null,
                    google_maps_url: listing.mapsUrl || null,
                    status,
                    telegram_code: listing.telegramCode,
                    internal_notes:
                        listing.internalNotes?.trim() || `Telegram Import Code: ${listing.telegramCode}`,
                };

                const { data: property, error: propertyError } = await supabaseAdmin
                    .from("properties")
                    .insert(propertyPayload)
                    .select()
                    .single();

                if (propertyError) throw propertyError;

                // Upload each photo blob attached for this listing, in order.
                const imagePayloads: {
                    property_id: string;
                    image_url: string;
                    is_cover: boolean;
                    display_order: number;
                }[] = [];

                for (let i = 0; i < listing.photoPaths.length; i++) {
                    const file = formData.get(`photo::${listing.telegramCode}::${i}`);
                    if (!(file instanceof File)) continue;

                    const bytes = Buffer.from(await file.arrayBuffer());
                    const storagePath = `properties/${property.id}/${crypto.randomUUID()}.jpg`;

                    const { error: uploadError } = await supabaseAdmin.storage
                        .from("property-images")
                        .upload(storagePath, bytes, { contentType: "image/jpeg", upsert: true });

                    if (uploadError) {
                        console.error(`Failed to upload photo ${i} for ${listing.telegramCode}:`, uploadError);
                        continue;
                    }

                    const { data: publicUrlData } = supabaseAdmin.storage
                        .from("property-images")
                        .getPublicUrl(storagePath);

                    imagePayloads.push({
                        property_id: property.id,
                        image_url: publicUrlData.publicUrl,
                        is_cover: i === 0,
                        display_order: i,
                    });
                }

                if (imagePayloads.length > 0) {
                    const { error: imageError } = await supabaseAdmin
                        .from("property_images")
                        .insert(imagePayloads);
                    if (imageError) console.error("Error inserting property images:", imageError);
                }

                insertedProperties.push(property);
            } catch (listingErr: unknown) {
                const message =
                    listingErr && typeof listingErr === "object" && "message" in listingErr
                        ? String((listingErr as { message: unknown }).message)
                        : "Unknown error";
                console.error(`Failed to import ${listing.telegramCode}:`, listingErr);
                failed.push({ telegramCode: listing.telegramCode, error: message });
            }
        }

        return NextResponse.json({
            success: failed.length === 0,
            importedCount: insertedProperties.length,
            skipped,
            failed,
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}