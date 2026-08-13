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