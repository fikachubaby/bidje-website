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

const REMARK_REQUIRED_STATUSES = ["Verification Rejected", "Rejected"];

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    try {
        const { id } = await params;
        const { status, remark, dealTypeCode } = await request.json();

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

        let dealTypeSuggestion = null;

        // Scenario B: offer accepted — suggest legal deal type, instantiate stages
        if (status === "Accepted") {
            const { data: suggestionRows, error: suggestError } = await supabaseAdmin.rpc(
                "suggest_deal_type",
                {
                    p_property_id: offer.property_id,
                    p_purchase_method: offer.purchase_method,
                }
            );

            if (suggestError) {
                console.error("suggest_deal_type failed:", suggestError);
            } else {
                dealTypeSuggestion = suggestionRows?.[0] ?? null;
            }

            // If the frontend already confirmed a deal type (second call after staff review),
            // instantiate the legal case stages now.
            if (dealTypeCode) {
                const finalSuggestion = dealTypeSuggestion ?? {};
                await supabaseAdmin.rpc("instantiate_legal_stages", {
                    p_offer_id: id,
                    p_deal_type: dealTypeCode,
                    p_needs_leasehold_consent: finalSuggestion.needs_leasehold_consent ?? false,
                    p_needs_bumi_consent: finalSuggestion.needs_bumi_consent ?? false,
                });

                await supabaseAdmin
                    .from("offers")
                    .update({ deal_type_code: dealTypeCode })
                    .eq("id", id);
            }
        }

        // Scenario A: notify buyer when verification is rejected
        if (status === "Verification Rejected") {
            // TODO: wire to your buyer-facing notification mechanism
        }

        return NextResponse.json({ success: true, offer, dealTypeSuggestion });
    } catch (err: unknown) {
        console.error("PATCH /api/admin/offers/[id] failed:", err);
        const msg = err instanceof Error ? err.message : "Failed to update offer status";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
