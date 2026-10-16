import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

type Params = { params: Promise<{ docId: string }> };

const COST_COLUMN = {
    purchase: "purchase_price",
    legal: "legal_cost",
    renovation: "renovation_cost",
    other: "other_cost",
} as const;

/**
 * Approve: the ticked lines are added to the property's costs. Reject: nothing changes.
 * Body: { action: "approve" | "reject", includedIds?: string[] }
 */
export async function POST(req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { docId } = await params;
    const { action, includedIds = [] } = await req.json();

    const { data: doc, error } = await supabaseAdmin
        .from("investor_documents")
        .select("id, status, file_name, investor_property_id, investor_document_transactions (*)")
        .eq("id", docId)
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    if (doc.status !== "pending_review") {
        return NextResponse.json({ error: "This document has already been reviewed" }, { status: 409 });
    }

    if (action === "approve") {
        const included = new Set<string>(includedIds);
        const lines = (doc.investor_document_transactions ?? []) as {
            id: string;
            amount: number;
            category: keyof typeof COST_COLUMN | "unrelated";
        }[];
        const totals: Record<string, number> = {};
        for (const t of lines) {
            const col = t.category !== "unrelated" && included.has(t.id) ? COST_COLUMN[t.category] : null;
            if (col) totals[col] = (totals[col] ?? 0) + Number(t.amount);
        }

        await supabaseAdmin
            .from("investor_document_transactions")
            .update({ included: false })
            .eq("document_id", docId)
            .not("id", "in", `(${[...included].join(",") || "00000000-0000-0000-0000-000000000000"})`);

        if (Object.keys(totals).length) {
            const { data: prop, error: pErr } = await supabaseAdmin
                .from("investor_properties")
                .select(Object.keys(totals).join(","))
                .eq("id", doc.investor_property_id)
                .single();
            if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

            const current = prop as unknown as Record<string, number | null>;
            const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
            for (const [col, add] of Object.entries(totals)) update[col] = Number(current[col] ?? 0) + add;
            const { error: uErr } = await supabaseAdmin
                .from("investor_properties")
                .update(update)
                .eq("id", doc.investor_property_id);
            if (uErr) return NextResponse.json({ error: uErr.message }, { status: 500 });

            const total = Object.values(totals).reduce((a, b) => a + b, 0);
            await supabaseAdmin.from("investor_property_updates").insert({
                investor_property_id: doc.investor_property_id,
                category: "finance",
                message: `Costs from "${doc.file_name}" verified: RM ${total.toLocaleString("en-MY", { minimumFractionDigits: 2 })} added.`,
                created_by: session.user.id,
            });
        }
    }

    const { error: sErr } = await supabaseAdmin
        .from("investor_documents")
        .update({
            status: action === "approve" ? "approved" : "rejected",
            reviewed_by: session.user.id,
            reviewed_at: new Date().toISOString(),
        })
        .eq("id", docId);
    if (sErr) return NextResponse.json({ error: sErr.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
