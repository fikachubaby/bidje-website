import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { syncPropertyToTelegram } from "@/lib/telegram/telegram-bot";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { generateSlug } from "@/lib/utils/property-utils";

// GET /api/admin/properties
export async function GET(request: Request) {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const search = searchParams.get("search")?.trim() || "";
        const status = searchParams.get("status") || "All";

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseAdmin
            .from("properties")
            .select("*, property_images(*), property_documents(*)", { count: "exact" });

        if (status !== "All") {
            query = query.eq("status", status);
        }

        if (search) {
            query = query.or(
                `title.ilike.%${search}%,full_address.ilike.%${search}%,district.ilike.%${search}%,state.ilike.%${search}%,property_type.ilike.%${search}%,telegram_code.ilike.${search}%`
            );
        }

        query = query.order("created_at", { ascending: false }).range(from, to);

        const { data: properties, count, error } = await query;

        if (error) throw error;

        const formatted = (properties || []).map((p) => {
            const sortedImages = (p.property_images || [])
                .sort((a: { display_order?: number }, b: { display_order?: number }) => (a.display_order ?? 0) - (b.display_order ?? 0))
                .map((img: { image_url: string }) => img.image_url);

            const sortedDocuments = (p.property_documents || [])
                .map((doc: { url: string }) => doc.url);

            return {
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
                builtUpSize: p.built_up_size || "",
                description: p.description || "",
                status: p.status,
                createdAt: p.created_at,
                updatedAt: p.updated_at,
                outstandingDebt: Number(p.outstanding_debt ?? 0),
                minimumPrice: p.minimum_acceptable_price != null ? Number(p.minimum_acceptable_price) : 0,
                internalNotes: p.internal_notes || "",
                isAddressHidden: p.is_address_hidden || false,
                documents: sortedDocuments,
                furnishing: p.furnishing || "Unfurnished",
                tags: p.tags || [],
                images: sortedImages,
                telegramCode: p.telegram_code || "",
            };
        });

        const totalCount = count ?? 0;
        const totalPages = Math.ceil(totalCount / limit) || 1;

        return NextResponse.json({
            properties: formatted,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
            },
        });
    } catch (err: unknown) {
        console.error("SUPABASE FETCH ERROR ON GET /api/admin/properties:", err);
        const msg = err instanceof Error ? err.message : "Failed to fetch properties";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

// POST /api/admin/properties
export async function POST(request: Request) {
    try {
        const check = await requireStaffSession();
        if (check && "error" in check && check.error) {
            return check.error;
        }

        let body;
        try {
            body = await request.json();
        } catch (parseErr) {
            console.error("Failed to parse request JSON:", parseErr);
            return NextResponse.json({ error: "Invalid JSON body payload" }, { status: 400 });
        }

        const title = body.name || body.title || "Untitled Property";
        const slug = generateSlug(title);

        const insertPayload = {
            title: title,
            slug: slug,
            asking_price: body.price ?? body.askingPrice ?? 0,
            full_address: body.address || body.fullAddress || "Address Pending",
            state: body.state || "Unknown",
            district: body.district || null,
            property_type: body.propertyType || "Residential",
            tenure: body.tenure === "Freehold" ? "Freehold" : "Leasehold",
            bumi_status: ["Bumi", "Non Bumi"].includes(body.bumiStatus) ? body.bumiStatus : "Unknown",
            land_size: body.landSize || null,
            built_up_size: body.builtUpSize || body.builtUp || null,
            bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
            bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
            description: body.description || null,
            google_maps_url: body.mapsUrl || null,
            status: body.status || "Draft",
            outstanding_debt: body.outstandingDebt ?? 0,
            minimum_acceptable_price: body.minimumPrice ?? null,
            internal_notes: body.internalNotes || null,
            is_address_hidden: body.isAddressHidden ?? false,
            furnishing: body.furnishing || null,
            tags: body.tags || [],
        };

        const { data: property, error } = await supabaseAdmin
            .from("properties")
            .insert(insertPayload)
            .select()
            .single();

        if (error) {
            console.error("SUPABASE INSERT ERROR OBJECT:", JSON.stringify(error, null, 2));
            throw new Error(error.message || "Database insert failed");
        }

        const images: string[] = body.images || [];
        if (images.length > 0) {
            const imageRows = images.map((url, index) => ({
                property_id: property.id,
                image_url: url,
                is_cover: index === 0,
                display_order: index,
            }));
            await supabaseAdmin.from("property_images").insert(imageRows);
        }

        const documents: string[] = body.documents || [];
        if (documents.length > 0) {
            const docRows = documents.map((url) => ({
                property_id: property.id,
                url: url,
                doc_type: "PDF",
                staff_only: true,
            }));
            await supabaseAdmin.from("property_documents").insert(docRows);
        }

        try {
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
                images
            );
        } catch (tgErr) {
            console.error("Telegram sync non-fatal warning:", tgErr);
        }

        return NextResponse.json({ success: true, property }, { status: 201 });

    } catch (err: unknown) {
        console.error("GRAND CATCH ON POST /api/admin/properties:", err);
        const errorMessage = err instanceof Error ? err.message : "Unknown server error occurred";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}