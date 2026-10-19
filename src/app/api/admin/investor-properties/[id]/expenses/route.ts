import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { DOCUMENT_BUCKET } from "@/lib/investor-server/documents";

type Params = { params: Promise<{ id: string }> };

/** Expenses the investor recorded on this property, with short-lived receipt links. */
export async function GET(_req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;

    const { data, error } = await supabaseAdmin
        .from("investor_expenses")
        .select("id, category, amount, note, receipt_path, receipt_name, created_at")
        .eq("investor_property_id", id)
        .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const paths = (data ?? []).map((e) => e.receipt_path).filter(Boolean) as string[];
    const signed = paths.length
        ? (await supabaseAdmin.storage.from(DOCUMENT_BUCKET).createSignedUrls(paths, 600)).data ?? []
        : [];
    const urlFor = new Map(signed.map((s) => [s.path, s.signedUrl]));

    return NextResponse.json({
        expenses: (data ?? []).map((e) => ({
            id: e.id,
            category: e.category,
            amount: Number(e.amount),
            note: e.note,
            receiptName: e.receipt_name,
            receiptUrl: e.receipt_path ? urlFor.get(e.receipt_path) ?? null : null,
            createdAt: e.created_at,
        })),
    });
}
