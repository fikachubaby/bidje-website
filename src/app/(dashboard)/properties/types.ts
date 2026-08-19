/** A row from the `property_images` table, joined onto a `properties` query. */
export interface RawPropertyImageRow {
    id?: unknown;
    image_url?: unknown;
    is_cover?: unknown;
    display_order?: unknown;
}

/**
 * Shape of a row as it comes back from `properties` joined with
 * `property_images(...)` (or from a joined `properties (...)` relation on
 * another query, e.g. from `offers`). Loosely typed on purpose — Supabase
 * returns `unknown`-ish records and we validate/narrow every field in
 * `mapPropertyRowToListing`.
 */
export interface RawPropertyRow {
    id?: unknown;
    title?: unknown;
    district?: unknown;
    state?: unknown;
    asking_price?: unknown;
    property_type?: unknown;
    bedrooms?: unknown;
    bathrooms?: unknown;
    area_sqft?: unknown;
    status?: unknown;
    created_at?: unknown;
    /** Joined `property_images` rows — array or single object depending on Supabase's FK inference. */
    property_images?: unknown;
}
