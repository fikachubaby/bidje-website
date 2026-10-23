import { NextResponse } from "next/server";
import { runAuctionAlerts } from "@/lib/auction-alerts/run";
import { sendMetaWhatsAppTemplate } from "@/lib/meta-whatsapp";
import { normalizePhone } from "@/lib/phone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function requiredEnv(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) throw new Error(`${name} is not configured`);
    return value;
}

function maskPhone(value: string): string {
    const normalized = normalizePhone(value) || value;
    if (normalized.length <= 4) return "****";
    return `${"*".repeat(Math.max(0, normalized.length - 4))}${normalized.slice(-4)}`;
}

async function runSingleTestAlert() {
    const recipients = requiredEnv("AUCTION_ALERT_RECIPIENTS")
        .split(",")
        .map((value) => normalizePhone(value))
        .filter((value): value is string => Boolean(value));

    if (!recipients.length) {
        throw new Error("AUCTION_ALERT_RECIPIENTS contains no valid phone numbers");
    }

    const recipient = recipients[0];
    const templateName = requiredEnv("META_WHATSAPP_AUCTION_TEMPLATE_NAME");
    const languageCode =
        process.env.META_WHATSAPP_AUCTION_TEMPLATE_LANG?.trim() || "en";

    const result = await sendMetaWhatsAppTemplate({
        to: recipient,
        templateName,
        languageCode,
        variables: [
            "Selangor (TEST)",
            "2-storey terrace house",
            "RM 300,000",
            "31 Oct 2026",
            "BIDJE Auction Alert Test Listing",
            "https://www.bidje.com",
        ],
    });

    return {
        test: true,
        recipient: maskPhone(recipient),
        messageId: result.messageId,
    };
}

export async function GET(req: Request) {
    const expected =
        process.env.AUCTION_ALERT_CRON_SECRET?.trim() ||
        process.env.CRON_SECRET?.trim();

    if (!expected || req.headers.get("authorization") !== `Bearer ${expected}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        if (url.searchParams.get("test") === "1") {
            const result = await runSingleTestAlert();
            return NextResponse.json({ success: true, ...result });
        }

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
