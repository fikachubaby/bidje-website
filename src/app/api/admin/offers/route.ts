import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

// GET /api/admin/offers
export async function GET(request: Request) {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "All";

        const offset = (page - 1) * limit;

        let query = supabaseAdmin
            .from("offers")
            .select("*, properties!offers_property_id_fkey(*)", { count: "exact" });

        if (status && status !== "All") {
            query = query.eq("status", status);
        }

        query = query
            .order("submitted_at", { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: offers, count, error } = await query;

        if (error) throw error;

        const userIds = [...new Set((offers ?? []).map((o) => o.user_id))];

        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from("profiles")
            .select("id, full_name, email, phone")
            .in("id", userIds.length > 0 ? userIds : [""]);

        if (profilesError) throw profilesError;

        const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

        const formatted = (offers || []).map((o) => {
            const profile = profileMap.get(o.user_id);
            const propertyRaw = Array.isArray(o.properties) ? o.properties[0] : o.properties;

            const property = propertyRaw
                ? {
                    id: propertyRaw.id,
                    name: propertyRaw.title || propertyRaw.name || "Untitled Property",
                    title: propertyRaw.title || propertyRaw.name || "Untitled Property",
                    price: Number(propertyRaw.asking_price || propertyRaw.price || 0),
                    minimumPrice: propertyRaw.minimum_acceptable_price ? Number(propertyRaw.minimum_acceptable_price) : undefined,
                    district: propertyRaw.district || "",
                    state: propertyRaw.state || "",
                    address: propertyRaw.address || "",
                    status: propertyRaw.status || "Available",
                    propertyType: propertyRaw.property_type || "",
                    tenure: propertyRaw.tenure || "",
                    bumiStatus: propertyRaw.bumi_status || "Non-Bumi",
                    images: Array.isArray(propertyRaw.images) ? propertyRaw.images : [],
                    createdAt: propertyRaw.created_at || "",
                    updatedAt: propertyRaw.updated_at || "",
                }
                : undefined;

            return {
                id: o.id,
                propertyId: o.property_id,
                propertyTitle: property?.title || "Untitled Property",
                property,
                buyerName: profile?.full_name || "Unknown",
                buyerPhone: o.contact_phone || profile?.phone || "",
                buyerEmail: profile?.email || "",
                amount: Number(o.offer_price),
                message: "",
                status: o.status,
                createdAt: o.submitted_at,
                icDocumentUrl: o.ic_upload_url || undefined,
                paymentProofUrl: o.payment_proof_url || undefined,
                verificationRemark: o.verification_remark || null,
            };
        });

        let finalOffers = formatted;
        if (search) {
            const queryLower = search.toLowerCase();
            finalOffers = formatted.filter(
                (o) =>
                    o.buyerName.toLowerCase().includes(queryLower) ||
                    o.buyerPhone.toLowerCase().includes(queryLower) ||
                    o.buyerEmail.toLowerCase().includes(queryLower) ||
                    o.id.toLowerCase().includes(queryLower)
            );
        }

        const totalCount = count || 0;
        const totalPages = Math.ceil(totalCount / limit) || 1;

        return NextResponse.json({
            offers: finalOffers,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
            },
        });
    } catch (err: unknown) {
        console.error("GET /api/admin/offers failed:", err);
        const msg = err instanceof Error ? err.message : "Failed to fetch offers";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}