import type { AuctionAlertRule } from "./types";

/**
 * User's requested auction filters:
 * - Selangor landed only, reserve price up to RM400k
 * - Negeri Sembilan landed only, reserve price up to RM300k
 * - Johor Bahru District landed only, reserve price up to RM400k
 */
export const AUCTION_ALERT_RULES: AuctionAlertRule[] = [
    {
        sourceState: "Selangor",
        label: "Selangor",
        maxReservePrice: 400_000,
    },
    {
        sourceState: "Negeri Sembilan",
        label: "Negeri Sembilan",
        maxReservePrice: 300_000,
    },
    {
        sourceState: "Johor",
        label: "Johor Bahru District",
        maxReservePrice: 400_000,
        // LelongProperty does not expose an official district field, so match
        // common localities within Johor Bahru District instead of requiring
        // the literal words "Johor Bahru" in the address.
        addressMustIncludeAny: [
            "Johor Bahru",
            "Pasir Gudang",
            "Masai",
            "Bandar Seri Alam",
            "Taman Kota Masai",
            "Plentong",
            "Permas Jaya",
            "Ulu Tiram",
            "Tebrau",
            "Mount Austin",
            "Austin Perdana",
            "Desa Tebrau",
            "Taman Molek",
            "Kempas",
            "Tampoi",
            "Larkin",
            "Danga Bay",
            "Skudai",
            "Iskandar Puteri",
            "Nusajaya",
            "Gelang Patah",
            "Bukit Indah",
            "Nusa Bestari",
            "Horizon Hills",
            "Medini",
            "Puteri Harbour",
            "Taman Universiti",
            "Mutiara Rini",
            "Perling",
            "Kangkar Pulai",
        ],
    },
];

/**
 * LelongProperty public search categories:
 * 3 = Terrace / Link / Townhouse
 * 4 = Semi-D / Bungalow / Villa
 *
 * A second title-level filter below removes non-landed/ambiguous results.
 */
export const LELONGPROPERTY_LANDED_TYPE_IDS = [3, 4] as const;

const INCLUDE_LANDED =
    /\b(terrace|link(?:ed)? house|semi[\s-]?detached|semi[\s-]?d\b|detached house|bungalow|cluster house|superlink|villa)\b/i;

const EXCLUDE_NON_LANDED =
    /\b(town\s?house|apartment|condominium|flat|soho|service apartment|shop|office|retail|land|factory|warehouse|hotel)\b/i;

export function isClearlyLanded(title: string): boolean {
    return INCLUDE_LANDED.test(title) && !EXCLUDE_NON_LANDED.test(title);
}
