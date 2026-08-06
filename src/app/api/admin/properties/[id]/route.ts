import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { syncPropertyToTelegram } from "@/lib/telegram/telegram-bot";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const { data: property, error } = await supabaseAdmin
            .from("properties")
            .update({
                title: body.name || body.title,
                asking_price: body.price ?? body.askingPrice,
                full_address: body.address || body.fullAddress,
                state: body.state,
                district: body.district,
                property_type: body.propertyType,
                tenure: body.tenure,
                bumi_status: body.bumiStatus,
                land_size: body.landSize,
                built_up_size: body.builtUpSize,
                bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
                bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
                description: body.description,
                status: body.status,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        syncPropertyToTelegram(
            {
                id: property.id,
                telegramCode: property.telegram_code,
                telegramChatId: property.telegram_chat_id,
                telegramMessageIds: property.telegram_message_ids,
                telegramHasCaption: property.telegram_has_caption,
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

        return NextResponse.json({ success: true, property });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update property";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

// PATCH /api/admin/properties/[id]
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status } = await request.json();

        const { data: property, error } = await supabaseAdmin
            .from("properties")
            .update({ status, updated_at: new Date().toISOString() })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, property });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update property status";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

// DELETE /api/admin/properties/[id]
export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { error } = await supabaseAdmin.from("properties").delete().eq("id", id);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to delete property";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}