import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { addExpense, ExpenseInputError, listExpenses } from "@/lib/investor-server/expenses";

type Params = { params: Promise<{ id: string }> };

const fail = (err: unknown) =>
    NextResponse.json({ error: (err as Error).message }, { status: err instanceof ExpenseInputError ? 400 : 500 });

/** Expenses recorded on this property (by the investor or admin), with short-lived receipt links. */
export async function GET(_req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;
    try {
        return NextResponse.json({ expenses: await listExpenses(id, 600) });
    } catch (err) {
        return fail(err);
    }
}

/** Admin records an expense with its receipt; the amount is added to the property's matching cost. */
export async function POST(req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;
    try {
        await addExpense(id, session.user.id, await req.formData());
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (err) {
        return fail(err);
    }
}
