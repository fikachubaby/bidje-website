import type { PropertyListing } from "@/types/property";
import type { RawPropertyImageRow, RawPropertyRow } from "./types";

export const DEFAULT_PROPERTY_IMAGE = "/placeholder-property.jpg";

const EXCLUDED_STATUSES = new Set(["draft", "archived", "inactive"]);

/** True when a property's status means it shouldn't appear in public listings. */
export function isExcludedFromListing(status: unknown): boolean {
    return EXCLUDED_STATUSES.has(String(status ?? "").toLowerCase().trim());
}

/**
 * Normalizes the joined `property_images` relation (array or single object,
 * depending on how Supabase infers the FK direction) into a plain array.
 */
function normalizePropertyImages(raw: unknown): RawPropertyImageRow[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as RawPropertyImageRow[];
    if (typeof raw === "object") return [raw as RawPropertyImageRow];
    return [];
}

/**
 * Picks the best available image from a property's joined `property_images`
 * rows: the row marked `is_cover`, otherwise the lowest `display_order`,
 * falling back to a placeholder when there are no images.
 */
export function resolvePropertyImage(row: RawPropertyRow): string {
    const images = normalizePropertyImages(row.property_images)
        .filter((img): img is RawPropertyImageRow & { image_url: string } =>
            typeof img.image_url === "string" && img.image_url.trim().length > 0
        );

    if (images.length === 0) return DEFAULT_PROPERTY_IMAGE;

    const cover = images.find((img) => img.is_cover === true);
    if (cover) return cover.image_url.trim();

    const sorted = [...images].sort(
        (a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0)
    );
    return sorted[0].image_url.trim();
}

/** Formats an asking price, hiding it behind a login prompt for non-members. */
export function formatPropertyPrice(row: RawPropertyRow, isMember: boolean): string {
    if (!isMember) return "Login to View Price";
    const priceVal = row.asking_price;
    if (!priceVal) return "Price Unavailable";
    return `RM ${Number(priceVal).toLocaleString()}`;
}

/** Formats a "district, state" location string, respecting membership gating. */
export function formatPropertyLocation(row: RawPropertyRow, isMember: boolean): string {
    if (!isMember) return "Members Only";
    const district = typeof row.district === "string" ? row.district : "";
    const state = typeof row.state === "string" ? row.state : "";
    const combined = `${district}${district && state ? ", " : ""}${state}`;
    return combined || "Location Unspecified";
}

/**
 * Maps a raw Supabase `properties` row (or a joined `properties` relation
 * object on an `offers` row) into the flat `PropertyListing` shape the UI
 * renders. This is the single place that logic lives — both the featured
 * listings grid and the offer history table go through it.
 */
export function mapPropertyRowToListing(row: RawPropertyRow, isMember: boolean): PropertyListing | null {
    const id = String(row.id ?? "").trim();
    if (!id) return null;

    const title = typeof row.title === "string" && row.title.trim() ? row.title.trim() : "Untitled Property";
    const propertyType = typeof row.property_type === "string" && row.property_type ? row.property_type : "Property";

    return {
        id,
        title,
        location: formatPropertyLocation(row, isMember),
        price: formatPropertyPrice(row, isMember),
        type: propertyType,
        beds: Number(row.bedrooms) || 0,
        baths: Number(row.bathrooms) || 0,
        sqft: Number(row.area_sqft) || 0,
        image: resolvePropertyImage(row),
    };
}
