import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { mapScreening } from "@/lib/financing/screening-server";
import { SCREENING_STATUSES } from "@/constants/financing-screening";

/** Screenings for staff review, newest first, with applicant contact details. */
export async function GET(req: Request) {
    const session = await requireStaffSession();
    if (session.error) return session.error;

    const status = new URL(req.url).searchParams.get("status");
    let query = supabaseAdmin
        .from("financing_screenings")
        .select("*, financing_screening_documents (id, doc_key, file_name, size_bytes, created_at)")
        .order("created_at", { ascending: false })
        .limit(200);
    if (status && (SCREENING_STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const userIds = [...new Set((data ?? []).map((r) => r.user_id as string))];
    const { data: profiles } = userIds.length
        ? await supabaseAdmin.from("profiles").select("id, full_name, email, phone").in("id", userIds)
        : { data: [] };
    const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

    return NextResponse.json({
        screenings: (data ?? []).map((row) => {
            const p = byId.get(row.user_id);
            return {
                ...mapScreening(row),
                applicant: { name: p?.full_name ?? null, email: p?.email ?? null, phone: p?.phone ?? null },
                documentsPurgedAt: row.documents_purged_at ?? null,
            };
        }),
    });
}
