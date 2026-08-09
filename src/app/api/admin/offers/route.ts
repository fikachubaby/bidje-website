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
            .select("*, properties(id, title, asking_price, minimum_acceptable_price)", { count: "exact" });

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
            return {
                id: o.id,
                propertyId: o.property_id,
                buyerName: profile?.full_name || "Unknown",
                buyerPhone: o.contact_phone || profile?.phone || "",
                buyerEmail: profile?.email || "",
                amount: Number(o.offer_price),
                message: "",
                status: o.status,
                createdAt: o.submitted_at,
                icDocumentUrl: o.ic_upload_url || undefined,
                paymentProofUrl: o.payment_proof_url || undefined,
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
        const msg = err instanceof Error ? err.message : "Failed to fetch offers";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}