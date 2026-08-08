import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

// GET /api/admin/offers
export async function GET() {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    try {
        const { data: offers, error } = await supabaseAdmin
            .from("offers")
            .select("*, properties(id, title, asking_price, minimum_acceptable_price)")
            .order("submitted_at", { ascending: false });

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
                status:
                    o.status === "pending"
                        ? "Pending"
                        : o.status === "accepted"
                            ? "Accepted"
                            : "Rejected",
                createdAt: o.submitted_at,
            };
        });

        return NextResponse.json({ offers: formatted });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to fetch offers";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}