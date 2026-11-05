import { createHash } from "node:crypto";
import { AUCTION_ALERT_RULES, isClearlyLanded } from "./config";
import type { AuctionListing, AuctionSourceResult } from "./types";

const SOURCE = "ehsanauctioneers" as const;
const INDEX_URL = "https://www.ehsanauctioneers.com/Project/search";
const USER_AGENT =
    "Mozilla/5.0 (compatible; BidjeAuctionAlert/2.2; +https://www.bidje.com)";

const CLEARLY_NON_LANDED =
    /\b(apartment|condominium|condo|flat|service(?:d)? apartment|soho|studio|shop|office|retail)\b/i;

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
        throw new Error(`Ehsan returned HTTP ${response.status} for ${url}`);
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

function parseDate(value: string): string | null {
    const match = value.match(/(20\d{2})-(\d{1,2})-(\d{1,2})/);
    if (!match) return null;
    return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

function extractDetailLinks(html: string): string[] {
    const links = new Set<string>();
    const normalized = decodeEntities(html);

    for (const match of normalized.matchAll(
        /href=["']([^"']*\/(?:Page|page)\/projectDetails\/[^"'#?]+)["']/gi
    )) {
        try {
            links.add(new URL(match[1], INDEX_URL).toString());
        } catch {
            // Ignore malformed links.
        }
    }

    return [...links];
}

function fieldValue(lines: string[], label: RegExp, start = 0, end = lines.length): string | null {
    for (let i = start; i < Math.min(end, lines.length); i++) {
        const line = lines[i];
        const match = line.match(label);
        if (!match) continue;

        const inline = match[1]?.replace(/^:\s*/, "").trim();
        if (inline) return inline;

        for (let j = i + 1; j <= Math.min(i + 2, lines.length - 1); j++) {
            const candidate = lines[j].replace(/^:\s*/, "").trim();
            if (candidate && candidate !== ":") return candidate;
        }
    }
    return null;
}

function matchingRule(address: string, propertyType: string, reservePrice: number) {
    if (!isClearlyLanded(propertyType)) return null;
    const text = address.toLowerCase();

    for (const rule of AUCTION_ALERT_RULES) {
        if (!text.includes(rule.sourceState.toLowerCase())) continue;
        if (reservePrice > rule.maxReservePrice) continue;

        if (
            rule.addressMustInclude?.length &&
            !rule.addressMustInclude.every((needle) =>
                text.includes(needle.toLowerCase())
            )
        ) {
            continue;
        }

        if (
            rule.addressMustIncludeAny?.length &&
            !rule.addressMustIncludeAny.some((needle) =>
                text.includes(needle.toLowerCase())
            )
        ) {
            continue;
        }

        return rule;
    }

    return null;
}

function parseEhsanDetail(html: string, sourceUrl: string): AuctionListing | null {
    const lines = htmlToLines(html);
    const propertyDetailsIndex = lines.findIndex((line) => /^Property Details$/i.test(line));
    if (propertyDetailsIndex < 0) return null;

    const auctionDetailsIndex = lines.findIndex(
        (line, index) => index > propertyDetailsIndex && /^Auction Details$/i.test(line)
    );
    const propertySectionEnd = auctionDetailsIndex > 0 ? auctionDetailsIndex : propertyDetailsIndex + 30;

    // Ehsan detail pages contain sidebar recommendations. Always read Type from
    // the main Property Details section instead of searching the entire page for
    // words such as "Terrace House".
    const explicitType = fieldValue(
        lines,
        /^Type\s*:?\s*(.*)$/i,
        propertyDetailsIndex + 1,
        propertySectionEnd
    );
    if (!explicitType) return null;

    // Hard reject non-landed types before examining any description/sidebar text.
    if (CLEARLY_NON_LANDED.test(explicitType)) return null;

    const address = lines.find(
        (line, index) =>
            index < propertyDetailsIndex &&
            line.length >= 12 &&
            line.length <= 500 &&
            /(Selangor|Negeri Sembilan|Johor)/i.test(line) &&
            !/^State\s*:?/i.test(line)
    );
    if (!address) return null;

    const addressIndex = lines.indexOf(address);
    const mainHeaderWindow = lines.slice(
        Math.max(0, addressIndex),
        Math.min(propertyDetailsIndex, addressIndex + 12)
    );

    const description = mainHeaderWindow.find(
        (line) =>
            line !== address &&
            !/^RM\s*[\d,]+/i.test(line) &&
            !/(Agent Submission|Registration for Online Bidders|Download Proclamation|View\(s\))/i.test(line) &&
            /\b(terrace|terraced|link(?:ed)? house|semi[\s-]?detached|semi[\s-]?d|detached house|bungalow|cluster house|superlink|villa|house)\b/i.test(line)
    );

    // Ehsan often uses the broad Type "House". In that case the main listing
    // description carries the actual landed subtype (e.g. terraced house).
    const classificationText = `${explicitType} ${description || ""}`.trim();
    if (!isClearlyLanded(classificationText)) return null;

    const priceLine = mainHeaderWindow.find((line) => /RM\s*[\d,]+(?:\.\d{1,2})?/i.test(line));
    const reservePrice = priceLine ? parseMoney(priceLine) : null;
    if (!reservePrice) return null;

    const rule = matchingRule(address, classificationText, reservePrice);
    if (!rule) return null;

    let auctionDate: string | null = null;
    if (auctionDetailsIndex >= 0) {
        const auctionDateText = fieldValue(
            lines,
            /^Auction Date\s*:?\s*(.*)$/i,
            auctionDetailsIndex + 1,
            Math.min(lines.length, auctionDetailsIndex + 40)
        );
        if (auctionDateText) auctionDate = parseDate(auctionDateText);
    }

    const ourRef =
        auctionDetailsIndex >= 0
            ? fieldValue(
                  lines,
                  /^Our Ref\s*:?\s*(.*)$/i,
                  auctionDetailsIndex + 1,
                  Math.min(lines.length, auctionDetailsIndex + 30)
              )
            : null;

    const propertyType = description || explicitType;

    return {
        source: SOURCE,
        externalKey: hashKey([
            SOURCE,
            ourRef || sourceUrl,
            address.toLowerCase(),
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

export async function fetchEhsanDirect(): Promise<AuctionSourceResult> {
    const listings: AuctionListing[] = [];
    const errors: string[] = [];
    let pagesFetched = 0;

    try {
        const indexHtml = await fetchHtml(INDEX_URL);
        pagesFetched++;
        const links = extractDetailLinks(indexHtml);
        const limit = Math.max(
            1,
            Math.min(100, Number(process.env.AUCTION_ALERT_EHSAN_DETAIL_LIMIT || "50") || 50)
        );
        const concurrency = Math.max(
            1,
            Math.min(8, Number(process.env.AUCTION_ALERT_EHSAN_CONCURRENCY || "5") || 5)
        );

        for (let i = 0; i < Math.min(links.length, limit); i += concurrency) {
            const batch = links.slice(i, i + concurrency);
            const settled = await Promise.allSettled(
                batch.map(async (url) => ({ url, html: await fetchHtml(url) }))
            );

            for (const result of settled) {
                if (result.status === "fulfilled") {
                    pagesFetched++;
                    const listing = parseEhsanDetail(result.value.html, result.value.url);
                    if (listing) listings.push(listing);
                } else if (errors.length < 25) {
                    errors.push(
                        result.reason instanceof Error
                            ? result.reason.message
                            : String(result.reason)
                    );
                }
            }
        }

        if (!links.length) {
            errors.push("Ehsan search page returned no project detail links");
        }
    } catch (error) {
        errors.push(error instanceof Error ? error.message : String(error));
    }

    const today = todayMalaysia();
    const unique = new Map<string, AuctionListing>();
    for (const listing of listings) {
        if (listing.auctionDate && listing.auctionDate < today) continue;
        unique.set(listing.externalKey, listing);
    }

    return {
        source: SOURCE,
        listings: [...unique.values()],
        pagesFetched,
        errors,
    };
}
