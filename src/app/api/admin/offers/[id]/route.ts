import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

// PATCH /api/admin/offers/[id]
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    try {
        const { id } = await params;
        const { status } = await request.json();

        const dbStatus =
            status === "Accepted" ? "accepted" : status === "Rejected" ? "rejected" : "pending";

        const { data: offer, error } = await supabaseAdmin
            .from("offers")
            .update({ status: dbStatus })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, offer });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to update offer status";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}