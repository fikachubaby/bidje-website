import { createHash } from "node:crypto";
import { AUCTION_ALERT_RULES, isClearlyLanded, LELONGPROPERTY_LANDED_TYPE_IDS } from "./config";
import type {
    AuctionListing,
    AuctionSourceName,
    AuctionSourceResult,
} from "./types";

const USER_AGENT =
    "Mozilla/5.0 (compatible; BidjeAuctionAlert/2.0; +https://www.bidje.com)";

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
        .replace(/<\/(p|div|li|h1|h2|h3|h4|h5|h6|a|td|tr|section|article|span)>/gi, "\n");

    return decodeEntities(cleaned.replace(/<[^>]+>/g, " "))
        .split(/\r?\n/)
        .map((line) => line.replace(/\s+/g, " ").trim())
        .filter(Boolean);
}

async function fetchHtml(url: string, signal = AbortSignal.timeout(20_000)): Promise<string> {
    const response = await fetch(url, {
        cache: "no-store",
        headers: {
            "User-Agent": USER_AGENT,
            Accept: "text/html,application/xhtml+xml",
            "Accept-Language": "en-MY,en;q=0.9,ms-MY;q=0.8",
        },
        signal,
    });

    if (!response.ok) {
        throw new Error(`${url} returned HTTP ${response.status}`);
    }
    return response.text();
}

function parseMoney(value: string): number | null {
    const match = value.replace(/\u200c/g, "").match(/RM\s*([\d,]+(?:\.\d{1,2})?)/i);
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

function parseAuctionDate(value: string): string | null {
    const raw = value
        .replace(/^Auction Date\s*:?\s*/i, "")
        .replace(/^To be auctioned\s*/i, "")
        .trim();

    let match = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) return isoDate(Number(match[1]), Number(match[2]), Number(match[3]));

    match = raw.match(/^(\d{1,2})[-\s]([A-Za-z]{3,9})[-,\s]+(\d{4})/);
    if (match) {
        const month = MONTHS[match[2].slice(0, 3).toLowerCase()];
        if (month) return isoDate(Number(match[3]), month, Number(match[1]));
    }

    match = raw.match(/^(?:[A-Za-z]{3,9},\s*)?([A-Za-z]{3,9})\s+(\d{1,2}),\s*(\d{4})/);
    if (match) {
        const month = MONTHS[match[1].slice(0, 3).toLowerCase()];
        if (month) return isoDate(Number(match[3]), month, Number(match[2]));
    }

    return null;
}

function todayMalaysiaParts(): [number, number, number] {
    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date());
    const [year, month, day] = today.split("-").map(Number);
    return [year, month, day];
}

function relativeAuctionDate(value: string): string | null {
    if (/tomorrow/i.test(value)) {
        const [year, month, day] = todayMalaysiaParts();
        const date = new Date(Date.UTC(year, month - 1, day + 1, 12));
        return isoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    }

    const match = value.match(/in\s+(\d+)\s+days?/i);
    if (!match) return null;
    const [year, month, day] = todayMalaysiaParts();
    const date = new Date(Date.UTC(year, month - 1, day + Number(match[1]), 12));
    return isoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

function hashKey(parts: Array<string | number | null>): string {
    return createHash("sha256")
        .update(parts.map((part) => String(part ?? "")).join("|"))
        .digest("hex");
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

function makeListing(args: {
    source: AuctionSourceName;
    sourceUrl: string;
    title: string;
    address: string;
    reservePrice: number;
    auctionDate: string | null;
}): AuctionListing | null {
    const rule = matchingRule(args.address, args.title, args.reservePrice);
    if (!rule) return null;

    return {
        source: args.source,
        externalKey: hashKey([
            args.source,
            args.address.toLowerCase(),
            args.auctionDate,
            args.reservePrice,
        ]),
        sourceUrl: args.sourceUrl,
        title: args.title,
        address: args.address,
        state: rule.label,
        reservePrice: args.reservePrice,
        auctionDate: args.auctionDate,
        propertyType: args.title,
    };
}

function futureOnly(listings: AuctionListing[]): AuctionListing[] {
    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kuala_Lumpur",
    }).format(new Date());
    return listings.filter((listing) => !listing.auctionDate || listing.auctionDate >= today);
}

function uniqueListings(listings: AuctionListing[]): AuctionListing[] {
    const unique = new Map<string, AuctionListing>();
    for (const listing of listings) unique.set(listing.externalKey, listing);
    return [...unique.values()];
}

function stateAddress(lines: string[], start: number, end: number): string | null {
    const states = ["Selangor", "Negeri Sembilan", "Johor"];
    for (let i = start; i <= Math.min(end, lines.length - 1); i++) {
        if (states.some((state) => lines[i].toLowerCase().includes(state.toLowerCase()))) {
            return lines[i];
        }
    }
    return null;
}

function parseListingStylePage(
    html: string,
    source: AuctionSourceName,
    sourceUrl: string
): AuctionListing[] {
    const lines = htmlToLines(html);
    const out: AuctionListing[] = [];

    for (let i = 0; i < lines.length; i++) {
        const title = lines[i];
        if (!isClearlyLanded(title)) continue;

        const address = stateAddress(lines, i + 1, i + 8);
        if (!address) continue;

        const window = lines.slice(i, i + 18);
        const priceLine = window.find((line) => /(?:Reserve|Auction) Price\s*:?\s*RM/i.test(line));
        const dateIndex = window.findIndex((line) => /^Auction Date\s*:?/i.test(line));
        const reservePrice = priceLine ? parseMoney(priceLine) : null;
        if (!reservePrice) continue;

        let auctionDate: string | null = null;
        if (dateIndex >= 0) {
            auctionDate = parseAuctionDate(window[dateIndex]);
            if (!auctionDate && window[dateIndex + 1]) {
                auctionDate = parseAuctionDate(window[dateIndex + 1]);
            }
        }

        const listing = makeListing({
            source,
            sourceUrl,
            title,
            address,
            reservePrice,
            auctionDate,
        });
        if (listing) out.push(listing);
    }

    return out;
}

async function fetchLelongTips(): Promise<AuctionSourceResult> {
    const source = "lelongtips" as const;
    const urls = [
        "https://www.lelongtips.com.my/search?state=Selangor",
        "https://www.lelongtips.com.my/search?state=Negeri%20Sembilan",
        "https://www.lelongtips.com.my/search?state=Johor",
    ];
    const listings: AuctionListing[] = [];
    const errors: string[] = [];
    let pagesFetched = 0;

    for (const url of urls) {
        try {
            const html = await fetchHtml(url);
            pagesFetched++;
            listings.push(...parseListingStylePage(html, source, url));
        } catch (error) {
            errors.push(error instanceof Error ? error.message : String(error));
        }
    }

    return { source, listings: futureOnly(uniqueListings(listings)), pagesFetched, errors };
}

async function fetchListingLelong(): Promise<AuctionSourceResult> {
    const source = "listinglelong" as const;
    const searches = AUCTION_ALERT_RULES.flatMap((rule) =>
        LELONGPROPERTY_LANDED_TYPE_IDS.map((type) => {
            const url = new URL("https://www.listinglelong.my/search");
            url.search = new URLSearchParams({
                state: rule.sourceState,
                property_type: String(type),
                max_price: String(rule.maxReservePrice),
                sort: "recent",
            }).toString();
            return url;
        })
    );
    const listings: AuctionListing[] = [];
    const errors: string[] = [];
    let pagesFetched = 0;

    const scanDeadline = AbortSignal.timeout(40_000);

    async function scanPage(search: URL, page: number): Promise<number> {
        const url = new URL(search);
        url.searchParams.set("page", String(page));

        try {
            const html = await fetchHtml(url.toString(), AbortSignal.any([scanDeadline, AbortSignal.timeout(6_000)]));
            pagesFetched++;
            listings.push(...parseListingStylePage(html, source, url.toString()));

            // The pagination bar includes the last page. The public search is
            // ordered by auction date, so page one alone misses future listings.
            const pagination = html.match(/<ul\b[^>]*\bpagination-custom\b[^>]*>([\s\S]*?)<\/ul>/i);
            const pageNumbers = Array.from(
                pagination?.[1].matchAll(/[?&]page=(\d+)/g) ?? [],
                (match) => Number(match[1])
            );
            return Math.max(page, ...pageNumbers);
        } catch (error) {
            errors.push(error instanceof Error ? error.message : String(error));
            return page;
        }
    }

    const lastPages = await Promise.all(searches.map((search) => scanPage(search, 1)));
    const pageLimit = 24;
    const remaining = searches.flatMap((search, index) => {
        const lastPage = lastPages[index];
        if (lastPage > pageLimit) {
            errors.push(`ListingLelong search has ${lastPage} pages. Scanning the first ${pageLimit}: ${search}`);
        }
        return Array.from(
            { length: Math.min(lastPage, pageLimit) - 1 },
            (_, index) => ({ search, page: index + 2 })
        );
    });

    remaining.sort((a, b) => a.page - b.page);
    for (let index = 0; index < remaining.length; index += 12) {
        if (scanDeadline.aborted) {
            errors.push(`ListingLelong scan timed out with ${remaining.length - index} pages still to check`);
            break;
        }
        await Promise.all(
            remaining.slice(index, index + 12).map(({ search, page }) => scanPage(search, page))
        );
    }

    return { source, listings: futureOnly(uniqueListings(listings)), pagesFetched, errors };
}

function parseNgChanMauPage(html: string, url: string): AuctionListing[] {
    const lines = htmlToLines(html);
    const out: AuctionListing[] = [];

    for (let i = 0; i < lines.length; i++) {
        const title = lines[i];
        if (!isClearlyLanded(title)) continue;

        let address: string | null = null;
        let reservePrice: number | null = null;
        for (let j = i - 1; j >= Math.max(0, i - 10); j--) {
            if (!address && /(Selangor|Negeri Sembilan|Johor)/i.test(lines[j])) {
                address = lines[j];
                continue;
            }
            if (address && !reservePrice) {
                reservePrice = parseMoney(lines[j]);
                if (reservePrice) break;
            }
        }
        if (!address || !reservePrice) continue;

        let auctionDate: string | null = null;
        for (let j = i + 1; j <= Math.min(lines.length - 1, i + 8); j++) {
            if (/Auction Date/i.test(lines[j])) {
                auctionDate = parseAuctionDate(lines[j]);
                if (!auctionDate && lines[j + 1]) auctionDate = parseAuctionDate(lines[j + 1]);
            }
            if (!auctionDate && /To be auctioned/i.test(lines[j])) {
                auctionDate = relativeAuctionDate(lines[j]);
            }
            if (auctionDate) break;
        }

        const listing = makeListing({
            source: "ngchanmau",
            sourceUrl: url,
            title,
            address,
            reservePrice,
            auctionDate,
        });
        if (listing) out.push(listing);
    }

    return out;
}

async function fetchNgChanMau(): Promise<AuctionSourceResult> {
    const source = "ngchanmau" as const;
    const states = ["Selangor", "Negeri Sembilan", "Johor"];
    const maxPages = Math.max(
        1,
        Math.min(10, Number(process.env.AUCTION_ALERT_NGCHANMAU_MAX_PAGES || "3") || 3)
    );
    const listings: AuctionListing[] = [];
    const errors: string[] = [];
    let pagesFetched = 0;

    for (const state of states) {
        for (let page = 1; page <= maxPages; page++) {
            const url = `https://beta.ngchanmau.com/reduced-price-property?page=${page}&refine-state=${encodeURIComponent(state)}&sort=drop-desc`;
            try {
                const html = await fetchHtml(url);
                pagesFetched++;
                listings.push(...parseNgChanMauPage(html, url));
            } catch (error) {
                errors.push(error instanceof Error ? error.message : String(error));
                break;
            }
        }
    }

    return { source, listings: futureOnly(uniqueListings(listings)), pagesFetched, errors };
}

async function fetchSerembanLandOffice(): Promise<AuctionSourceResult> {
    const source = "seremban-land-office" as const;
    const urls = [
        "https://seremban.ns.gov.my/iklan-untuk-lelongan-awam/",
        "https://seremban.ns.gov.my/iklan-untuk-lelongan-awam-2/",
        "https://seremban.ns.gov.my/iklan-untuk-lelongan-awam-3/",
    ];
    const listings: AuctionListing[] = [];
    const errors: string[] = [];
    let pagesFetched = 0;
    let noticesFound = 0;

    for (const url of urls) {
        try {
            const html = await fetchHtml(url);
            pagesFetched++;
            listings.push(...parseListingStylePage(html, source, url));
            const noticeMatches = html.match(/LELONGAN\s+AWAM\s*[–-]\s*PTS\.[\d.]+/gi);
            noticesFound += noticeMatches?.length || 0;
        } catch (error) {
            errors.push(error instanceof Error ? error.message : String(error));
        }
    }

    if (noticesFound && !listings.length) {
        errors.push(
            `Seremban Land Office published ${noticesFound} auction notice(s), but the property details are in downloadable/scanned notices and cannot yet be safely price-filtered from the HTML page alone`
        );
    }

    return { source, listings: futureOnly(uniqueListings(listings)), pagesFetched, errors };
}

export async function fetchAdditionalAuctionSources(): Promise<AuctionSourceResult[]> {
    const collectors = [
        fetchLelongTips,
        fetchSerembanLandOffice,
        fetchNgChanMau,
        fetchListingLelong,
    ];

    const settled = await Promise.allSettled(collectors.map((collector) => collector()));
    return settled.map((result, index) => {
        if (result.status === "fulfilled") return result.value;
        const names: AuctionSourceName[] = [
            "lelongtips",
            "seremban-land-office",
            "ngchanmau",
            "listinglelong",
        ];
        return {
            source: names[index],
            listings: [],
            pagesFetched: 0,
            errors: [result.reason instanceof Error ? result.reason.message : String(result.reason)],
        };
    });
}

const SOURCE_PRIORITY: AuctionSourceName[] = [
    "elelong",
    "seremban-land-office",
    "ehsanauctioneers",
    "ngchanmau",
    "lelongtips",
    "listinglelong",
    "lelongproperty",
];

function canonicalAddress(value: string): string {
    return value
        .toLowerCase()
        .replace(/\b(no\.?|unit|house|lot)\s*/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function dedupeAuctionListings(listings: AuctionListing[]): AuctionListing[] {
    const sorted = [...listings].sort(
        (a, b) => SOURCE_PRIORITY.indexOf(a.source) - SOURCE_PRIORITY.indexOf(b.source)
    );
    const unique = new Map<string, AuctionListing>();

    for (const listing of sorted) {
        const key = hashKey([
            canonicalAddress(listing.address),
            listing.auctionDate,
            Math.round(listing.reservePrice),
        ]);
        if (!unique.has(key)) unique.set(key, listing);
    }

    return [...unique.values()];
}
