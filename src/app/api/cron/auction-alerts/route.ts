import { NextResponse } from "next/server";
import { runAuctionAlerts } from "@/lib/auction-alerts/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
    const expected = process.env.CRON_SECRET;
    if (!expected || req.headers.get("authorization") !== `Bearer ${expected}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await runAuctionAlerts();
        return NextResponse.json({ success: true, ...result });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown auction alert error";
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
