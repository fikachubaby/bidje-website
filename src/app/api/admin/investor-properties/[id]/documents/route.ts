import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { DOCUMENT_BUCKET } from "@/lib/investor-server/documents";

type Params = { params: Promise<{ id: string }> };

/** Uploaded documents with AI-extracted lines and a short-lived link to the file. */
export async function GET(_req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;

    const { data, error } = await supabaseAdmin
        .from("investor_documents")
        .select("*, investor_document_transactions (*)")
        .eq("investor_property_id", id)
        .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const documents = await Promise.all(
        (data ?? []).map(async (d) => {
            const { data: signed } = await supabaseAdmin.storage.from(DOCUMENT_BUCKET).createSignedUrl(d.file_path, 600);
            return {
                id: d.id,
                fileName: d.file_name,
                status: d.status,
                aiSummary: d.ai_summary,
                error: d.error,
                createdAt: d.created_at,
                url: signed?.signedUrl ?? null,
                transactions: (d.investor_document_transactions ?? []).map((t: Record<string, unknown>) => ({
                    id: t.id,
                    date: t.txn_date,
                    description: t.description,
                    amount: Number(t.amount),
                    category: t.category,
                    confidence: t.confidence === null ? null : Number(t.confidence),
                    included: t.included,
                })),
            };
        })
    );

    return NextResponse.json({ documents });
}
