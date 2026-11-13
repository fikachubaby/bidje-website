import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { addExpense, ExpenseInputError, listExpenses } from "@/lib/investor-server/expenses";
import { INVESTOR_PROPERTY_SELECT, mapInvestorProperty } from "@/lib/investor-server/mapInvestorProperty";

async function ownProperty(userId: string, propertyId: string) {
    const { data, error } = await supabaseAdmin
        .from("investor_properties")
        .select("id")
        .eq("id", propertyId)
        .eq("investor_id", userId)
        .maybeSingle();
    // A query failure (e.g. missing column) must not be reported as "Not found".
    if (error) throw new Error(error.message);
    return data;
}

const fail = (err: unknown) =>
    NextResponse.json({ error: (err as Error).message }, { status: err instanceof ExpenseInputError ? 400 : 500 });

export async function GET(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const propertyId = new URL(req.url).searchParams.get("propertyId") ?? "";
    try {
        if (!(await ownProperty(session.user.id, propertyId))) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        return NextResponse.json({ expenses: await listExpenses(propertyId, 60 * 60) });
    } catch (err) {
        return fail(err);
    }
}

/** Records an expense with its receipt and adds the amount to the property's matching cost. */
export async function POST(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const form = await req.formData();
    const propertyId = String(form.get("investorPropertyId") ?? "");
    try {
        if (!(await ownProperty(session.user.id, propertyId))) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }
        await addExpense(propertyId, session.user.id, form);
    } catch (err) {
        return fail(err);
    }

    const { data, error } = await supabaseAdmin
        .from("investor_properties")
        .select(INVESTOR_PROPERTY_SELECT)
        .eq("id", propertyId)
        .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ property: mapInvestorProperty(data, { investorView: true }) }, { status: 201 });
}
