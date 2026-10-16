export type AdType = "BANNER" | "FEATURED_LISTING" | "PROMO_CAMPAIGN" | "HOMEPAGE_NATIVE";

export type AdPlacement =
    | "TOP_ANNOUNCEMENT_BAR"
    | "HOMEPAGE_HERO"
    | "PROPERTY_FEED_NATIVE"
    | "HOMEPAGE_SIDEBAR"
    | "PROMO_MODAL";

export interface Advertisement {
    id: string;
    title: string;
    type: AdType;
    placement: AdPlacement;
    image_url?: string;
    target_url?: string;
    property_id?: string;
    cta_text?: string;
    start_date: string;
    end_date?: string;
    is_active: boolean;
    priority: number;
    impressions_count: number;
    clicks_count: number;
    created_at?: string;
}

/** Dropdown options for the admin form. Values must match the types above. */
export const AD_TYPE_OPTIONS: { value: AdType; label: string }[] = [
    { value: "BANNER", label: "Banner" },
    { value: "PROMO_CAMPAIGN", label: "Promo campaign" },
    { value: "FEATURED_LISTING", label: "Featured listing" },
    { value: "HOMEPAGE_NATIVE", label: "Homepage native" },
];

/** Only placements the visitor site actually renders; add here when a new slot goes live. */
export const AD_PLACEMENT_OPTIONS: { value: AdPlacement; label: string }[] = [
    { value: "HOMEPAGE_HERO", label: "Homepage banner" },
];
