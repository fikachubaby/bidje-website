import { NextResponse } from "next/server";
import { runAuctionAlerts } from "@/lib/auction-alerts/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
    const auctionSecret = process.env.AUCTION_ALERT_CRON_SECRET?.trim();
    const cronSecret = process.env.CRON_SECRET?.trim();
    const expected = auctionSecret || cronSecret;
    const authorization = req.headers.get("authorization") ?? "";
    const receivedToken = authorization.startsWith("Bearer ")
        ? authorization.slice("Bearer ".length)
        : "";

    if (!expected || authorization !== `Bearer ${expected}`) {
        return NextResponse.json(
            {
                error: "Unauthorized",
                diagnostic: {
                    secretSource: auctionSecret
                        ? "AUCTION_ALERT_CRON_SECRET"
                        : cronSecret
                          ? "CRON_SECRET"
                          : "none",
                    expectedLength: expected?.length ?? 0,
                    authorizationPresent: authorization.length > 0,
                    bearerFormat: authorization.startsWith("Bearer "),
                    receivedTokenLength: receivedToken.length,
                },
            },
            { status: 401 }
        );
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
