import { createHash } from "node:crypto";
import { AUCTION_ALERT_RULES, isClearlyLanded } from "./config";
import type { AuctionAlertRule, AuctionListing, AuctionSourceResult } from "./types";

const SOURCE = "elelong" as const;
const ORIGIN = "https://elelong.kehakiman.gov.my";
const DETAIL_BASE = `${ORIGIN}/BidderWeb/Home/Detail`;
const USER_AGENT =
    "Mozilla/5.0 (compatible; BidjeAuctionAlert/2.1; +https://www.bidje.com)";

const SEED_URLS = [
    `${ORIGIN}/BidderWeb`,
    `${ORIGIN}/BidderWeb/Home`,
    `${ORIGIN}/BidderWeb/Home/Index`,
];

function decodeEntities(value: string): string {
    return value
        .replace(/&nbsp;|&#160;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&#x27;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">");
}

function htmlToLines(html: string): string[] {
    const cleaned = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|a|td|tr|section|article|span|label)>/gi, "\n");

    return decodeEntities(cleaned.replace(/<[^>]+>/g, " "))
        .split(/\r?\n/)
        .map((line) => line.replace(/\s+/g, " ").trim())
        .filter(Boolean);
}

async function fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
        cache: "no-store",
        redirect: "follow",
        headers: {
            "User-Agent": USER_AGENT,
            Accept: "text/html,application/xhtml+xml",
            "Accept-Language": "en-MY,en;q=0.9,ms-MY;q=0.8",
        },
        signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
        throw new Error(`e-Lelong returned HTTP ${response.status} for ${url}`);
    }

    return response.text();
}

function hashKey(parts: Array<string | number | null>): string {
    return createHash("sha256")
        .update(parts.map((part) => String(part ?? "")).join("|"))
        .digest("hex");
}

function parseMoney(value: string): number | null {
    const match = value.match(/RM\s*([\d,]+(?:\.\d{1,2})?)/i);
    if (!match) return null;
    const amount = Number(match[1].replace(/,/g, ""));
    return Number.isFinite(amount) && amount > 0 ? amount : null;
}

const MONTHS: Record<string, number> = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
};

function isoDate(year: number, month: number, day: number): string {
    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDate(value: string): string | null {
    const raw = value
        .replace(/^Auction Date\/Time\s*:?\s*/i, "")
        .replace(/^[A-Za-z]{3,9},\s*/, "")
        .trim();

    let match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) return isoDate(Number(match[1]), Number(match[2]), Number(match[3]));

    match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) return isoDate(Number(match[3]), Number(match[2]), Number(match[1]));

    match = raw.match(/^(\d{1,2})[-\s]([A-Za-z]{3,9})[-,\s]+(\d{4})/);
    if (match) {
        const month = MONTHS[match[2].slice(0, 3).toLowerCase()];
        if (month) return isoDate(Number(match[3]), month, Number(match[1]));
    }

    match = raw.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})/);
    if (match) {
        const month = MONTHS[match[1].slice(0, 3).toLowerCase()];
        if (month) return isoDate(Number(match[3]), month, Number(match[2]));
    }

    return null;
}

function extractDetailIds(html: string): string[] {
    const normalized = decodeEntities(html).replace(/\\\//g, "/");
    const ids = new Set<string>();
    const patterns = [
        /\/BidderWeb\/Home\/Detail\/(\d{3,})/gi,
        /\/Home\/Detail\/(\d{3,})/gi,
        /\bHome\/Detail\/(\d{3,})/gi,
        /\bDetail\/(\d{3,})/gi,
    ];

    for (const pattern of patterns) {
        for (const match of normalized.matchAll(pattern)) {
            ids.add(match[1]);
        }
    }

    return [...ids];
}

function lineValue(lines: string[], label: RegExp): string | null {
    for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(label);
        if (!match) continue;

        const inline = match[1]?.trim();
        if (inline) return inline;

        const next = lines[i + 1]?.trim();
        if (next && !/^[A-Za-z ()²/]+:\s*$/.test(next)) return next;
    }
    return null;
}

function findAddress(lines: string[]): string | null {
    const propertyIdIndex = lines.findIndex((line) => /^Property Id\s*:/i.test(line));
    if (propertyIdIndex > 0) {
        for (let i = propertyIdIndex - 1; i >= Math.max(0, propertyIdIndex - 4); i--) {
            const candidate = lines[i];
            if (
                candidate.length >= 12 &&
                candidate.length <= 500 &&
                /(Selangor|Negeri Sembilan|Johor)/i.test(candidate) &&
                !/^(State|District|Mukim)\s*:/i.test(candidate)
            ) {
                return candidate;
            }
        }
    }

    return (
        lines.find(
            (line) =>
                line.length >= 12 &&
                line.length <= 500 &&
                /(Selangor|Negeri Sembilan|Johor)/i.test(line) &&
                !/^(State|District|Mukim)\s*:/i.test(line)
        ) || null
    );
}

function matchingRule(
    address: string,
    state: string,
    district: string,
    propertyType: string,
    reservePrice: number
): AuctionAlertRule | null {
    if (!isClearlyLanded(propertyType)) return null;

    const locationText = `${address} ${state} ${district}`.toLowerCase();

    for (const rule of AUCTION_ALERT_RULES) {
        if (!locationText.includes(rule.sourceState.toLowerCase())) continue;
        if (reservePrice > rule.maxReservePrice) continue;

        if (
            rule.addressMustInclude?.length &&
            !rule.addressMustInclude.every((needle) =>
                locationText.includes(needle.toLowerCase())
            )
        ) {
            continue;
        }

        if (
            rule.addressMustIncludeAny?.length &&
            !rule.addressMustIncludeAny.some((needle) =>
                locationText.includes(needle.toLowerCase())
            )
        ) {
            continue;
        }

        return rule;
    }

    return null;
}

function parseDetail(html: string, sourceUrl: string): AuctionListing | null {
    const lines = htmlToLines(html);
    const address = findAddress(lines);
    if (!address) return null;

    const propertyType = lineValue(lines, /^Property Type\s*:\s*(.*)$/i);
    if (!propertyType || !isClearlyLanded(propertyType)) return null;

    const state = lineValue(lines, /^State\s*:\s*(.*)$/i) || "";
    const district = lineValue(lines, /^District\s*:\s*(.*)$/i) || "";

    const reserveText = lineValue(lines, /^Reserved Price(?: \(RM\))?\s*:\s*(.*)$/i);
    const reservePrice = reserveText ? parseMoney(reserveText) : null;
    if (!reservePrice) return null;

    const rule = matchingRule(address, state, district, propertyType, reservePrice);
    if (!rule) return null;

    let auctionDate: string | null = null;
    const auctionDateIndex = lines.findIndex((line) => /^Auction Date\/Time\s*:/i.test(line));
    if (auctionDateIndex >= 0) {
        auctionDate = parseDate(lines[auctionDateIndex]);
        if (!auctionDate) {
            for (
                let i = auctionDateIndex + 1;
                i <= Math.min(lines.length - 1, auctionDateIndex + 3);
                i++
            ) {
                auctionDate = parseDate(lines[i]);
                if (auctionDate) break;
            }
        }
    }

    const propertyId = lineValue(lines, /^Property Id\s*:\s*(.*)$/i);

    return {
        source: SOURCE,
        externalKey: hashKey([
            SOURCE,
            propertyId || sourceUrl,
            auctionDate,
            Math.round(reservePrice),
        ]),
        sourceUrl,
        title: propertyType,
        address,
        state: rule.label,
        reservePrice,
        auctionDate,
        propertyType,
    };
}

function todayMalaysia(): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date());
}

function futureOnly(listings: AuctionListing[]): AuctionListing[] {
    const today = todayMalaysia();
    return listings.filter((listing) => !listing.auctionDate || listing.auctionDate >= today);
}

function uniqueListings(listings: AuctionListing[]): AuctionListing[] {
    const unique = new Map<string, AuctionListing>();
    for (const listing of listings) unique.set(listing.externalKey, listing);
    return [...unique.values()];
}

async function fetchBatch(urls: string[], concurrency: number) {
    const out: Array<
        | { ok: true; url: string; html: string }
        | { ok: false; url: string; error: string }
    > = [];

    for (let i = 0; i < urls.length; i += concurrency) {
        const batch = urls.slice(i, i + concurrency);
        const settled = await Promise.allSettled(
            batch.map(async (url) => ({ url, html: await fetchHtml(url) }))
        );

        settled.forEach((result, index) => {
            const url = batch[index];
            if (result.status === "fulfilled") {
                out.push({ ok: true, url, html: result.value.html });
            } else {
                out.push({
                    ok: false,
                    url,
                    error:
                        result.reason instanceof Error
                            ? result.reason.message
                            : String(result.reason),
                });
            }
        });
    }

    return out;
}

export async function fetchELelongDirect(): Promise<AuctionSourceResult> {
    const listings: AuctionListing[] = [];
    const errors: string[] = [];
    let pagesFetched = 0;

    const detailLimit = Math.max(
        10,
        Math.min(100, Number(process.env.AUCTION_ALERT_ELELONG_DETAIL_LIMIT || "40") || 40)
    );
    const concurrency = Math.max(
        1,
        Math.min(8, Number(process.env.AUCTION_ALERT_ELELONG_CONCURRENCY || "5") || 5)
    );

    const seedResults = await fetchBatch(SEED_URLS, 3);
    const queue: string[] = [];
    const queued = new Set<string>();

    for (const result of seedResults) {
        if (!result.ok) {
            errors.push(result.error);
            continue;
        }

        pagesFetched++;
        for (const id of extractDetailIds(result.html)) {
            if (!queued.has(id)) {
                queued.add(id);
                queue.push(id);
            }
        }
    }

    if (!queue.length) {
        errors.push(
            "e-Lelong public home pages returned no discoverable auction detail IDs"
        );
        return { source: SOURCE, listings: [], pagesFetched, errors };
    }

    const visited = new Set<string>();

    while (queue.length && visited.size < detailLimit) {
        const ids: string[] = [];
        while (
            queue.length &&
            ids.length < concurrency &&
            visited.size + ids.length < detailLimit
        ) {
            const id = queue.shift()!;
            if (visited.has(id)) continue;
            ids.push(id);
        }

        if (!ids.length) break;

        const urls = ids.map((id) => `${DETAIL_BASE}/${id}`);
        const results = await fetchBatch(urls, concurrency);

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const id = ids[i];
            visited.add(id);

            if (!result.ok) {
                if (errors.length < 25) errors.push(result.error);
                continue;
            }

            pagesFetched++;
            const listing = parseDetail(result.html, result.url);
            if (listing) listings.push(listing);

            for (const discoveredId of extractDetailIds(result.html)) {
                if (!visited.has(discoveredId) && !queued.has(discoveredId)) {
                    queued.add(discoveredId);
                    queue.push(discoveredId);
                }
            }
        }
    }

    if (visited.size >= detailLimit && queue.length) {
        errors.push(
            `e-Lelong scan reached the configured detail limit (${detailLimit}); ${queue.length} additional linked auction(s) were left for the next scan`
        );
    }

    return {
        source: SOURCE,
        listings: futureOnly(uniqueListings(listings)),
        pagesFetched,
        errors,
    };
}
