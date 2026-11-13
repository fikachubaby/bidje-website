import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { DOCUMENT_BUCKET, isSupportedDocument, MAX_DOCUMENT_BYTES } from "@/lib/investor-server/documents";
import type { ExpenseCategory, InvestorExpense } from "@/types/investor";

// Each expense category adds to one cost column on the property.
const COST_COLUMN: Record<ExpenseCategory, "legal_cost" | "agent_fee" | "renovation_cost"> = {
    legal: "legal_cost",
    agent: "agent_fee",
    renovation: "renovation_cost",
};

/** A problem with the request itself (shown to the user as a 400). */
export class ExpenseInputError extends Error {}

/** Expenses on a property, newest first, with short-lived receipt links (private bucket). */
export async function listExpenses(propertyId: string, linkSeconds: number): Promise<InvestorExpense[]> {
    const { data, error } = await supabaseAdmin
        .from("investor_expenses")
        .select("id, category, amount, note, expense_date, receipt_path, receipt_name, created_at")
        .eq("investor_property_id", propertyId)
        .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const paths = (data ?? []).map((e) => e.receipt_path).filter(Boolean) as string[];
    const signed = paths.length
        ? (await supabaseAdmin.storage.from(DOCUMENT_BUCKET).createSignedUrls(paths, linkSeconds)).data ?? []
        : [];
    const urlFor = new Map(signed.map((s) => [s.path, s.signedUrl]));

    return (data ?? []).map((e) => ({
        id: e.id,
        category: e.category,
        amount: Number(e.amount),
        note: e.note,
        expenseDate: e.expense_date,
        receiptName: e.receipt_name,
        receiptUrl: e.receipt_path ? urlFor.get(e.receipt_path) ?? null : null,
        createdAt: e.created_at,
    }));
}

/**
 * Validates the form, stores the receipt, records the expense and adds the amount
 * to the property's matching cost. Callers check the user may access the property first.
 */
export async function addExpense(propertyId: string, createdBy: string, form: FormData) {
    const category = String(form.get("category") ?? "") as ExpenseCategory;
    const amount = Number(form.get("amount"));
    const note = String(form.get("note") ?? "").trim().slice(0, 300) || null;
    const date = String(form.get("expenseDate") ?? "");
    const file = form.get("receipt");

    if (!(category in COST_COLUMN)) throw new ExpenseInputError("Choose legal, agent or renovation");
    if (!(amount > 0)) throw new ExpenseInputError("Enter an amount above zero");
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ExpenseInputError("Enter a valid date");
    if (!(file instanceof File) || !file.size) throw new ExpenseInputError("Please attach the receipt");
    if (!isSupportedDocument(file.type)) throw new ExpenseInputError("Upload a PDF, JPG, PNG or WEBP file");
    if (file.size > MAX_DOCUMENT_BYTES) throw new ExpenseInputError("File must be under 10 MB");

    const column = COST_COLUMN[category];
    const { data: property, error: readErr } = await supabaseAdmin
        .from("investor_properties")
        .select(column)
        .eq("id", propertyId)
        .single();
    if (readErr) throw new Error(readErr.message);

    const path = `${propertyId}/expenses/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error: upErr } = await supabaseAdmin.storage
        .from(DOCUMENT_BUCKET)
        .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
    if (upErr) throw new Error(upErr.message);

    const { error: insErr } = await supabaseAdmin.from("investor_expenses").insert({
        investor_property_id: propertyId,
        category,
        amount,
        note,
        expense_date: date || null,
        receipt_path: path,
        receipt_name: file.name,
        created_by: createdBy,
    });
    if (insErr) {
        await supabaseAdmin.storage.from(DOCUMENT_BUCKET).remove([path]);
        throw new Error(insErr.message);
    }

    const current = Number((property as Record<string, unknown>)[column] ?? 0);
    const { error } = await supabaseAdmin
        .from("investor_properties")
        .update({ [column]: current + amount, updated_at: new Date().toISOString() })
        .eq("id", propertyId);
    if (error) throw new Error(error.message);
}
