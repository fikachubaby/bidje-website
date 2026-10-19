import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { getScreeningById } from "@/lib/financing/screening-server";
import {
    REVIEW_DECISIONS,
    SCREENING_DOCUMENT_BUCKET,
    SCREENING_DOCUMENT_RETENTION_DAYS,
    SCREENING_VALID_DAYS,
} from "@/constants/financing-screening";

type Params = { params: Promise<{ id: string }> };

const DAY = 24 * 60 * 60 * 1000;

/** Short-lived (5 min) links to one screening's documents. Never cached or stored. */
export async function GET(_req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;

    const { data, error } = await supabaseAdmin
        .from("financing_screening_documents")
        .select("id, file_path")
        .eq("screening_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const links = await Promise.all(
        (data ?? []).map(async (d) => {
            const { data: signed } = await supabaseAdmin.storage
                .from(SCREENING_DOCUMENT_BUCKET)
                .createSignedUrl(d.file_path, 300);
            return { id: d.id, url: signed?.signedUrl ?? null };
        })
    );
    return NextResponse.json({ links }, { headers: { "Cache-Control": "no-store" } });
}

const decisionSchema = z.object({
    status: z.enum(REVIEW_DECISIONS),
    remark: z.string().trim().max(1000).optional(),
});

/** Records the staff decision on a paid screening. */
export async function PATCH(req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;

    const parsed = decisionSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    const { status, remark } = parsed.data;
    if (status === "additional_documents_required" && !remark) {
        return NextResponse.json({ error: "Tell the purchaser which documents are needed." }, { status: 400 });
    }

    const screening = await getScreeningById(id);
    if (!screening) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!screening.feePaidAt) return NextResponse.json({ error: "Screening fee has not been paid." }, { status: 409 });

    const now = Date.now();
    const final = status !== "additional_documents_required";
    const { error } = await supabaseAdmin
        .from("financing_screenings")
        .update({
            status,
            staff_remark: remark || null,
            reviewed_by: session.user.id,
            reviewed_at: new Date(now).toISOString(),
            valid_until: status === "eligible" ? new Date(now + SCREENING_VALID_DAYS * DAY).toISOString() : null,
            documents_purge_after: final ? new Date(now + SCREENING_DOCUMENT_RETENTION_DAYS * DAY).toISOString() : null,
            updated_at: new Date(now).toISOString(),
        })
        .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ screening: await getScreeningById(id) });
}
