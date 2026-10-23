import { createHash } from "node:crypto";
import {
    AUCTION_ALERT_RULES,
    LELONGPROPERTY_LANDED_TYPE_IDS,
    isClearlyLanded,
} from "./config";
import type { AuctionAlertRule, AuctionListing } from "./types";

const SOURCE = "lelongproperty" as const;
const BASE_URL = "https://www.lelongproperty.com.my/search";

const META_PREFIX =
    /^(Built Up|Land Area|Tenure|Restriction|Deposit|Listing Type|Lot Type|Bedroom\(s\)|Bathroom\(s\))\s*:/i;

function decodeEntities(value: string): string {
    return value
        .replace(/&nbsp;|&#160;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&#x27;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&#(\d+);/g, (_, n: string) => {
            const code = Number(n);
            return Number.isFinite(code) ? String.fromCharCode(code) : _;
        });
}

function htmlToLines(html: string): string[] {
    const withoutScripts = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ");

    const withBreaks = withoutScripts
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|a|td|tr|section|article)>/gi, "\n");

    const text = decodeEntities(withBreaks.replace(/<[^>]+>/g, " "));

    return text
        .split(/\r?\n/)
        .map((line) => line.replace(/\s+/g, " ").trim())
        .filter(Boolean);
}

function parseMoney(line: string): number | null {
    const cleaned = line
        .replace(/^Reserve Price\s*:\s*/i, "")
        .replace(/[^\d.]/g, "");
    const amount = Number(cleaned);
    return Number.isFinite(amount) && amount > 0 ? amount : null;
}

const MONTHS: Record<string, string> = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12",
};

function parseAuctionDate(line: string): string | null {
    const raw = line
        .replace(/^Auction Date\s*:\s*/i, "")
        .replace(/^[A-Za-z]+,\s*/, "")
        .trim();

    const match = raw.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})$/);
    if (!match) return null;

    const month = MONTHS[match[1].slice(0, 3).toLowerCase()];
    if (!month) return null;

    return `${match[3]}-${month}-${match[2].padStart(2, "0")}`;
}

function hashKey(parts: Array<string | number | null>): string {
    return createHash("sha256")
        .update(parts.map((part) => String(part ?? "")).join("|"))
        .digest("hex");
}

function isLikelyListingTitle(value: string): boolean {
    if (value.length < 3 || value.length > 180) return false;
    return !/^(Contact Number|Email|Follow Us|Search Results|Sort By|Search)$/i.test(value);
}

function parsePage(
    html: string,
    rule: AuctionAlertRule,
    searchUrl: string
): AuctionListing[] {
    const lines = htmlToLines(html);
    const listings: AuctionListing[] = [];

    for (let i = 0; i < lines.length; i++) {
        if (!/^Auction Date\s*:/i.test(lines[i])) continue;

        let cursor = i - 1;
        while (cursor >= 0 && META_PREFIX.test(lines[cursor])) cursor--;
        if (cursor < 1) continue;

        const address = lines[cursor];
        const title = lines[cursor - 1];

        if (!isLikelyListingTitle(title)) continue;
        if (!isClearlyLanded(title)) continue;
        if (address.length < 8 || address.length > 500) continue;

        const reserveLine = lines
            .slice(i + 1, i + 6)
            .find((line) => /^Reserve Price\s*:/i.test(line));
        if (!reserveLine) continue;

        const reservePrice = parseMoney(reserveLine);
        if (!reservePrice || reservePrice > rule.maxReservePrice) continue;

        if (
            rule.addressMustInclude?.length &&
            !rule.addressMustInclude.every((needle) =>
                address.toLowerCase().includes(needle.toLowerCase())
            )
        ) {
            continue;
        }

        const auctionDate = parseAuctionDate(lines[i]);
        const targetedSourceUrl = `${BASE_URL}?keyword=${encodeURIComponent(address)}`;

        listings.push({
            source: SOURCE,
            externalKey: hashKey([
                SOURCE,
                title.toLowerCase(),
                address.toLowerCase(),
                auctionDate,
                reservePrice,
            ]),
            sourceUrl: targetedSourceUrl || searchUrl,
            title,
            address,
            state: rule.label,
            reservePrice,
            auctionDate,
            propertyType: title,
        });
    }

    const unique = new Map<string, AuctionListing>();
    for (const listing of listings) unique.set(listing.externalKey, listing);
    return [...unique.values()];
}

function todayMalaysia(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date());
}

async function fetchSearchPage(
    rule: AuctionAlertRule,
    propertyTypeId: number,
    page: number
): Promise<AuctionListing[]> {
    const params = new URLSearchParams({
        state: rule.sourceState,
        property_type: String(propertyTypeId),
        sort: "recent",
        page: String(page),
    });
    const url = `${BASE_URL}?${params.toString()}`;

    const response = await fetch(url, {
        cache: "no-store",
        headers: {
            "User-Agent":
                "Mozilla/5.0 (compatible; BidjeAuctionAlert/1.0; +https://www.bidje.com)",
            Accept: "text/html,application/xhtml+xml",
            "Accept-Language": "en-MY,en;q=0.9",
        },
        signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
        throw new Error(
            `LelongProperty fetch failed (${response.status}) for ${rule.label}, type ${propertyTypeId}`
        );
    }

    const html = await response.text();
    return parsePage(html, rule, url);
}

export async function fetchLelongPropertyMatches(): Promise<{
    listings: AuctionListing[];
    pagesFetched: number;
    errors: string[];
}> {
    const maxPages = Math.max(
        1,
        Math.min(3, Number(process.env.AUCTION_ALERT_SOURCE_MAX_PAGES || "1") || 1)
    );

    const jobs: Array<Promise<AuctionListing[]>> = [];
    for (const rule of AUCTION_ALERT_RULES) {
        for (const propertyTypeId of LELONGPROPERTY_LANDED_TYPE_IDS) {
            for (let page = 1; page <= maxPages; page++) {
                jobs.push(fetchSearchPage(rule, propertyTypeId, page));
            }
        }
    }

    const settled = await Promise.allSettled(jobs);
    const errors: string[] = [];
    const all: AuctionListing[] = [];

    for (const result of settled) {
        if (result.status === "fulfilled") {
            all.push(...result.value);
        } else {
            errors.push(
                result.reason instanceof Error
                    ? result.reason.message
                    : String(result.reason)
            );
        }
    }

    const today = todayMalaysia();
    const unique = new Map<string, AuctionListing>();
    for (const listing of all) {
        if (listing.auctionDate && listing.auctionDate < today) continue;
        unique.set(listing.externalKey, listing);
    }

    return {
        listings: [...unique.values()],
        pagesFetched: jobs.length,
        errors,
    };
}
