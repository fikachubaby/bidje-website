import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { getActiveScreening, getOwnedScreening } from "@/lib/financing/screening-server";
import {
    APPLICANT_TYPES,
    COMPANY_KINDS,
    CONSENT_VERSION,
    SCREENING_FEES,
    missingRequiredDocuments,
    screeningFee,
} from "@/constants/financing-screening";

/** Current user's active financing screening (or null). */
export async function GET() {
    const session = await requireUserSession();
    if (session.error) return session.error;
    return NextResponse.json({ screening: await getActiveScreening(session.user.id), fees: SCREENING_FEES });
}

const createSchema = z.object({
    applicantType: z.enum(APPLICANT_TYPES),
    companyKind: z.enum(COMPANY_KINDS).nullish(),
});

/** Starts a screening, or changes the applicant type while still collecting documents. */
export async function POST(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const parsed = createSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid applicant type" }, { status: 400 });
    const { applicantType } = parsed.data;
    const companyKind = applicantType === "company" ? parsed.data.companyKind ?? "sdn_bhd" : null;

    const active = await getActiveScreening(session.user.id);
    if (active && !["awaiting_documents", "payment_pending", "not_eligible"].includes(active.status)) {
        return NextResponse.json({ error: "Your screening is already in review." }, { status: 409 });
    }

    const values = {
        applicant_type: applicantType,
        company_kind: companyKind,
        fee_amount: screeningFee(applicantType),
        status: "awaiting_documents",
        consent_at: null,
        updated_at: new Date().toISOString(),
    };

    // A rejected result starts a fresh screening; an unpaid draft is just updated.
    const reuse = active && active.status !== "not_eligible" ? active.id : null;
    const query = reuse
        ? supabaseAdmin.from("financing_screenings").update(values).eq("id", reuse).select("id").single()
        : supabaseAdmin.from("financing_screenings").insert({ ...values, user_id: session.user.id }).select("id").single();
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ screening: await getOwnedScreening(session.user.id, data.id) });
}

const patchSchema = z.object({
    id: z.string().uuid(),
    action: z.enum(["consent", "resubmit"]),
    consents: z
        .object({ assessment: z.literal(true), fee: z.literal(true), bankDecision: z.literal(true) })
        .optional(),
});

/**
 * consent  — records the declaration once every required document is in; moves to payment.
 * resubmit — after staff ask for more documents, sends it back to review (no new fee).
 */
export async function PATCH(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Please tick all declarations to continue." }, { status: 400 });
    const { id, action } = parsed.data;

    const screening = await getOwnedScreening(session.user.id, id);
    if (!screening) return NextResponse.json({ error: "Screening not found" }, { status: 404 });

    const missing = missingRequiredDocuments(
        screening.applicantType,
        screening.companyKind,
        screening.documents.map((d) => d.docKey)
    );

    let update: Record<string, unknown>;
    if (action === "consent") {
        if (!parsed.data.consents) return NextResponse.json({ error: "Please tick all declarations to continue." }, { status: 400 });
        if (!["awaiting_documents", "payment_pending"].includes(screening.status)) {
            return NextResponse.json({ error: "Consent already recorded." }, { status: 409 });
        }
        if (missing.length) {
            return NextResponse.json({ error: `Still missing: ${missing.map((d) => d.label).join(", ")}` }, { status: 400 });
        }
        update = {
            status: "payment_pending",
            consent_at: new Date().toISOString(),
            consent_ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
            consent_version: CONSENT_VERSION,
        };
    } else {
        if (screening.status !== "additional_documents_required") {
            return NextResponse.json({ error: "Nothing to resubmit." }, { status: 409 });
        }
        update = { status: "under_review" };
    }

    const { error } = await supabaseAdmin
        .from("financing_screenings")
        .update({ ...update, updated_at: new Date().toISOString() })
        .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ screening: await getOwnedScreening(session.user.id, id) });
}
