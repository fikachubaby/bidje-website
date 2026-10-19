import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { DOCUMENT_BUCKET, isSupportedDocument, MAX_DOCUMENT_BYTES } from "@/lib/investor-server/documents";
import { INVESTOR_PROPERTY_SELECT, mapInvestorProperty } from "@/lib/investor-server/mapInvestorProperty";
import type { ExpenseCategory } from "@/types/investor";

// Each expense category adds to one cost column on the property.
const COST_COLUMN: Record<ExpenseCategory, "legal_cost" | "agent_fee" | "renovation_cost"> = {
    legal: "legal_cost",
    agent: "agent_fee",
    renovation: "renovation_cost",
};

async function ownProperty(userId: string, propertyId: string) {
    const { data, error } = await supabaseAdmin
        .from("investor_properties")
        .select("id, legal_cost, agent_fee, renovation_cost")
        .eq("id", propertyId)
        .eq("investor_id", userId)
        .maybeSingle();
    // A query failure (e.g. missing column) must not be reported as "Not found".
    if (error) throw new Error(error.message);
    return data;
}

export async function GET(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const propertyId = new URL(req.url).searchParams.get("propertyId") ?? "";
    try {
        if (!(await ownProperty(session.user.id, propertyId))) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
        .from("investor_expenses")
        .select("id, category, amount, note, receipt_path, receipt_name, created_at")
        .eq("investor_property_id", propertyId)
        .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Receipts live in a private bucket, so hand out short-lived links.
    const paths = (data ?? []).map((e) => e.receipt_path).filter(Boolean) as string[];
    const signed = paths.length
        ? (await supabaseAdmin.storage.from(DOCUMENT_BUCKET).createSignedUrls(paths, 60 * 60)).data ?? []
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

/** Records an expense with its receipt and adds the amount to the property's matching cost. */
export async function POST(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const form = await req.formData();
    const propertyId = String(form.get("investorPropertyId") ?? "");
    const category = String(form.get("category") ?? "") as ExpenseCategory;
    const amount = Number(form.get("amount"));
    const note = String(form.get("note") ?? "").trim() || null;
    const file = form.get("receipt");

    if (!(category in COST_COLUMN)) return NextResponse.json({ error: "Choose legal, agent or renovation" }, { status: 400 });
    if (!(amount > 0)) return NextResponse.json({ error: "Enter an amount above zero" }, { status: 400 });
    if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Please attach the receipt" }, { status: 400 });
    if (!isSupportedDocument(file.type)) {
        return NextResponse.json({ error: "Upload a PDF, JPG, PNG or WEBP file" }, { status: 400 });
    }
    if (file.size > MAX_DOCUMENT_BYTES) return NextResponse.json({ error: "File must be under 10 MB" }, { status: 400 });

    let property: Awaited<ReturnType<typeof ownProperty>>;
    try {
        property = await ownProperty(session.user.id, propertyId);
    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
    if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const path = `${propertyId}/expenses/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error: upErr } = await supabaseAdmin.storage
        .from(DOCUMENT_BUCKET)
        .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const { error: insErr } = await supabaseAdmin.from("investor_expenses").insert({
        investor_property_id: propertyId,
        category,
        amount,
        note,
        receipt_path: path,
        receipt_name: file.name,
        created_by: session.user.id,
    });
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    const column = COST_COLUMN[category];
    const { data, error } = await supabaseAdmin
        .from("investor_properties")
        .update({ [column]: Number(property[column] ?? 0) + amount, updated_at: new Date().toISOString() })
        .eq("id", propertyId)
        .select(INVESTOR_PROPERTY_SELECT)
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ property: mapInvestorProperty(data, { investorView: true }) }, { status: 201 });
}
