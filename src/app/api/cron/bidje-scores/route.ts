import { NextResponse } from "next/server";
import { recomputeBidjeScores } from "@/lib/score/recomputeScores";

export const maxDuration = 300;

export async function GET(req: Request) {
    if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        return NextResponse.json({ success: true, ...(await recomputeBidjeScores()) });
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Score run failed" }, { status: 500 });
    }
}
