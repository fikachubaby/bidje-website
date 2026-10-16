import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { deliverReminder } from "@/lib/reminders-server/deliverReminder";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;

    const { found, results } = await deliverReminder(id);
    if (!found) return NextResponse.json({ error: "Reminder not found" }, { status: 404 });

    const anyOk = results.some((r) => r.ok);
    return NextResponse.json({ success: anyOk, results }, { status: anyOk ? 200 : 502 });
}
