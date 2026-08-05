import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import type { TelegramParsedProperty } from "@/types/telegram-import";

export async function POST(request: Request) {
    try {
        const { listings }: { listings: TelegramParsedProperty[] } = await request.json();

        if (!listings || listings.length === 0) {
            return NextResponse.json({ error: "No listings selected for import" }, { status: 400 });
        }

        const insertedProperties = [];

        for (const listing of listings) {
            const propertyPayload = {
                title: listing.title || `Telegram Listing ${listing.telegramCode}`,
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
                bedrooms: listing.bedrooms ?? null,
                bathrooms: listing.bathrooms ?? null,
                description: listing.description || null,
                google_maps_url: listing.mapsUrl || null,
                status: "Draft",
                internal_notes: `Telegram Import Code: ${listing.telegramCode}`,
            };

            const { data: property, error: propertyError } = await supabaseAdmin
                .from("properties")
                .insert(propertyPayload)
                .select()
                .single();

            if (propertyError) throw propertyError;
            
            if (listing.photoPaths && listing.photoPaths.length > 0) {
                const imagePayloads = listing.photoPaths.map((photoPath, index) => ({
                    property_id: property.id,
                    image_url: photoPath,
                    is_cover: index === 0,
                    display_order: index,
                }));

                const { error: imageError } = await supabaseAdmin
                    .from("property_images")
                    .insert(imagePayloads);

                if (imageError) console.error("Error inserting property images:", imageError);
            }

            insertedProperties.push(property);
        }

        return NextResponse.json({ success: true, importedCount: insertedProperties.length });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}