import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { SCREENING_DOCUMENT_BUCKET } from "@/constants/financing-screening";

export const maxDuration = 300;

/** Deletes financing documents once their retention window after a decision has passed. */
export async function GET(req: Request) {
    if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: due, error } = await supabaseAdmin
        .from("financing_screenings")
        .select("id, financing_screening_documents (id, file_path)")
        .lt("documents_purge_after", new Date().toISOString())
        .is("documents_purged_at", null)
        .limit(100);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    let files = 0;
    for (const s of due ?? []) {
        const paths = (s.financing_screening_documents ?? []).map((d) => d.file_path);
        if (paths.length) {
            const { error: rmErr } = await supabaseAdmin.storage.from(SCREENING_DOCUMENT_BUCKET).remove(paths);
            if (rmErr) continue;
            files += paths.length;
        }
        await supabaseAdmin.from("financing_screening_documents").delete().eq("screening_id", s.id);
        await supabaseAdmin
            .from("financing_screenings")
            .update({ documents_purged_at: new Date().toISOString() })
            .eq("id", s.id);
    }

    return NextResponse.json({ success: true, screenings: due?.length ?? 0, files });
}
