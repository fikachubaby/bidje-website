import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { syncPropertyToTelegram } from "@/lib/telegram/telegram-bot";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { generateSlug } from "@/lib/utils/property-utils";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    try {
        const { id } = await params;
        const body = await request.json();
        const title = body.name || body.title;

        const { data: existingProp } = await supabaseAdmin
            .from("properties")
            .select("slug")
            .eq("id", id)
            .single();

        const slug = existingProp?.slug || generateSlug(title || "Property");

        const { data: property, error } = await supabaseAdmin
            .from("properties")
            .update({
                title: title,
                slug: slug,
                asking_price: body.price ?? body.askingPrice,
                full_address: body.address || body.fullAddress,
                state: body.state,
                district: body.district,
                property_type: body.propertyType,
                tenure: body.tenure,
                bumi_status: body.bumiStatus,
                land_size: body.landSize,
                built_up_size: body.builtUpSize || body.builtUp,
                bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
                bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
                description: body.description,
                google_maps_url: body.mapsUrl || null,
                status: body.status,
                outstanding_debt: body.outstandingDebt ?? 0,
                minimum_acceptable_price: body.minimumPrice ?? null,
                internal_notes: body.internalNotes || null,
                is_address_hidden: body.isAddressHidden ?? false,
                furnishing: body.furnishing || null,
                tags: body.tags || [],
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        const images: string[] = body.images || [];
        if (images.length >= 0) {
            await supabaseAdmin.from("property_images").delete().eq("property_id", id);

            if (images.length > 0) {
                const imageRows = images.map((url, index) => ({
                    property_id: id,
                    image_url: url,
                    is_cover: index === 0,
                    display_order: index,
                }));
                await supabaseAdmin.from("property_images").insert(imageRows);
            }
        }

        const documents: string[] = body.documents || [];
        if (documents.length >= 0) {
            await supabaseAdmin.from("property_documents").delete().eq("property_id", id);

            if (documents.length > 0) {
                const docRows = documents.map((url) => ({
                    property_id: id,
                    url: url,
                    doc_type: "PDF",
                    staff_only: true,
                }));
                await supabaseAdmin.from("property_documents").insert(docRows);
            }
        }

        await syncPropertyToTelegram(
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
            images
        );

        return NextResponse.json({ success: true, property });
    } catch (err: unknown) {
        console.error("DETAILED PROPERTY UPDATE ERROR:", err);
        const msg = err instanceof Error ? err.message : "Failed to update property";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

// PATCH /api/admin/properties/[id]
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const check = await requireStaffSession();
    if (check.error) return check.error;

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
    const check = await requireStaffSession();
    if (check.error) return check.error;

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