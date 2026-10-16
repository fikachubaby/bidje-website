import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import { analyseAndSave } from "@/lib/investor-server/aiMonitor";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;

    try {
        return NextResponse.json({ analysis: await analyseAndSave(id) });
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "AI analysis failed" }, { status: 500 });
    }
}
