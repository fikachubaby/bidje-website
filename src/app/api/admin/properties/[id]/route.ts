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
                status: property.status,
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
                description: property.description,
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

        const { data: imageRows } = await supabaseAdmin
            .from("property_images")
            .select("image_url, display_order")
            .eq("property_id", id)
            .order("display_order", { ascending: true });

        const images = (imageRows ?? []).map((r) => r.image_url);

        await syncPropertyToTelegram(
            {
                id: property.id,
                status: property.status,
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
                description: property.description,
            },
            images
        );

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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    try {
        const { id } = await params;

        const { data: p, error } = await supabaseAdmin
            .from("properties")
            .select("*, property_images(*), property_documents(*)")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === "PGRST116") {
                return NextResponse.json({ error: "Property not found" }, { status: 404 });
            }
            throw error;
        }

        const sortedImages = (p.property_images || [])
            .sort(
                (a: { display_order?: number }, b: { display_order?: number }) =>
                    (a.display_order ?? 0) - (b.display_order ?? 0)
            )
            .map((img: { image_url: string }) => img.image_url);

        const sortedDocuments = (p.property_documents || []).map(
            (doc: { id: string; url: string; doc_type: string | null; staff_only: boolean }) => ({
                id: doc.id,
                url: doc.url,
                docType: doc.doc_type,
                staffOnly: doc.staff_only,
            })
        );

        const formatted = {
            id: p.id,
            name: p.title,
            slug: p.slug || p.id,
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
            builtUp: p.built_up_size || "",
            description: p.description || "",
            status: p.status,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
            outstandingDebt: Number(p.outstanding_debt ?? 0),
            minimumPrice:
                p.minimum_acceptable_price != null ? Number(p.minimum_acceptable_price) : 0,
            internalNotes: p.internal_notes || "",
            isAddressHidden: p.is_address_hidden || false,
            furnishing: p.furnishing || "Unfurnished",
            tags: p.tags || [],
            images: sortedImages,
            documents: sortedDocuments,
            telegramCode: p.telegram_code || "",
            telegramChatId: p.telegram_chat_id || "",
            mapsUrl: p.google_maps_url || "",
            metaTitle: p.meta_title || "",
            metaDescription: p.meta_description || "",
            category: p.category || "",
            isFeatured: p.is_featured || false,
            urgentSale: p.urgent_sale || false,
            bidjeScore: p.bidje_score != null ? Number(p.bidje_score) : null,
            verifiedOfferCount: p.verified_offer_count || 0,
            marketValue: p.market_value != null ? Number(p.market_value) : null,
            maxLoanApplicable: p.max_loan_applicable != null ? Number(p.max_loan_applicable) : null,
            areaSqft: p.area_sqft != null ? Number(p.area_sqft) : null,
            currency: p.currency || "MYR",
        };

        return NextResponse.json({ property: formatted });
    } catch (err: unknown) {
        console.error("SUPABASE FETCH ERROR ON GET /api/admin/properties/[id]:", err);
        const msg = err instanceof Error ? err.message : "Failed to fetch property";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}