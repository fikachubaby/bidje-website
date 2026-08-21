import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

const ALLOWED_STATUSES = [
    "Submitted",
    "Pending Documents",
    "Under Verification",
    "Verification Rejected",
    "Verified",
    "Accepted",
    "Rejected",
];

// Statuses where a remark must be persisted and the buyer notified
const REMARK_REQUIRED_STATUSES = ["Verification Rejected", "Rejected"];

// PATCH /api/admin/offers/[id]
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    try {
        const { id } = await params;
        const { status, remark } = await request.json();

        if (!ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status value: ${status}` },
                { status: 400 }
            );
        }

        if (REMARK_REQUIRED_STATUSES.includes(status) && !remark?.trim()) {
            return NextResponse.json(
                { error: "A remark is required when rejecting an offer or its verification." },
                { status: 400 }
            );
        }

        const updatePayload: Record<string, unknown> = { status };

        if (status === "Verification Rejected") {
            updatePayload.verification_remark = remark.trim();
        }

        if (status === "Verified") {
            updatePayload.verified_at = new Date().toISOString();
            updatePayload.verification_remark = null;
        }

        if (status === "Rejected" && remark?.trim()) {
            updatePayload.verification_remark = remark.trim();
        }

        const { data: offer, error } = await supabaseAdmin
            .from("offers")
            .update(updatePayload)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        // Scenario A: notify buyer when verification is rejected
        if (status === "Verification Rejected") {
            // TODO: no email-sending utility found in the codebase yet.
            // Wire this to whatever you use for buyer-facing notifications
            // (Resend/SendGrid, a Supabase Edge Function, or a
            // `notifications` table your buyer UI polls). Example if you
            // add a notifications table:
            //
            // await supabaseAdmin.from("notifications").insert({
            //     user_id: offer.user_id,
            //     type: "offer_verification_rejected",
            //     message: remark.trim(),
            //     offer_id: id,
            // });
        }

        return NextResponse.json({ success: true, offer });
    } catch (err: unknown) {
        console.error("PATCH /api/admin/offers/[id] failed:", err);
        const msg = err instanceof Error ? err.message : "Failed to update offer status";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}