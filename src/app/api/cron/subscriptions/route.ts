import { NextResponse } from "next/server";
import { runSubscriptionRenewals } from "@/lib/subscriptions/renewals";

export const maxDuration = 300;

export async function GET(req: Request) {
    if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        return NextResponse.json({ success: true, ...(await runSubscriptionRenewals()) });
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Renewal run failed" }, { status: 500 });
    }
}
