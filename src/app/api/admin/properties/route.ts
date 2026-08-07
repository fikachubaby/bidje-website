import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { syncPropertyToTelegram } from "@/lib/telegram/telegram-bot";

// GET /api/admin/properties
export async function GET() {
    try {
        const { data: properties, error } = await supabaseAdmin
            .from("properties")
            .select("*, property_images(*)")
            .order("created_at", { ascending: false });

        if (error) throw error;

        const formatted = (properties || []).map((p) => ({
            id: p.id,
            name: p.title,
            price: Number(p.asking_price),
            address: p.full_address,
            state: p.state,
            district: p.district || "",
            propertyType: p.property_type,
            tenure: p.tenure,
            bumiStatus: p.bumi_status,
            bedrooms: p.bedrooms || 0,
            bathrooms: p.bathrooms || 0,
            landSize: p.land_size || "",
            builtUpSize: p.built_up_size || "",
            description: p.description || "",
            status: p.status,
            createdAt: p.created_at,
        }));

        return NextResponse.json({ properties: formatted });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to fetch properties";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

// POST /api/admin/properties
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { data: property, error } = await supabaseAdmin
            .from("properties")
            .insert({
                title: body.name || body.title,
                asking_price: body.price ?? body.askingPrice ?? 0,
                full_address: body.address || body.fullAddress || "Address Pending",
                state: body.state || "Unknown",
                district: body.district || null,
                property_type: body.propertyType || "Residential",
                tenure: body.tenure === "Freehold" ? "Freehold" : "Leasehold",
                bumi_status: ["Bumi", "Non Bumi"].includes(body.bumiStatus) ? body.bumiStatus : "Unknown",
                land_size: body.landSize || null,
                built_up_size: body.builtUpSize || null,
                bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
                bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
                description: body.description || null,
                status: body.status || "Draft",
            })
            .select()
            .single();

        if (error) throw error;

        // Must be awaited Vercel serverless kills the function once the
        // response is sent, so a fire-and-forget call here would silently
        // never complete.
        await syncPropertyToTelegram(
            {
                id: property.id,
                telegramCode: null,
                telegramChatId: null,
                telegramMessageIds: null,
                telegramHasCaption: null,
                title: property.title,
                fullAddress: property.full_address,
                mapsUrl: property.google_maps_url,
                propertyType: property.property_type,
                tenure: property.tenure,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                builtUpSize: property.built_up_size,
                landSize: property.land_size,
                askingPrice: Number(property.asking_price),
            },
            body.images ?? []
        );

        return NextResponse.json({ success: true, property }, { status: 201 });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to create property";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}