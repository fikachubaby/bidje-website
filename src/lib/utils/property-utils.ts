import type {
    AdminProperty,
    AdminPropertyInput,
    Property,
    PropertyCategory,
    TenureType,
    BumiStatusType,
} from "@/types/property";

// --- Formatting & Parsing ---
export function formatWithCommas(value: number | undefined | null): string {
    if (value === undefined || value === null || isNaN(value)) return "";
    if (value === 0) return "0";
    return value.toLocaleString("en-US");
}

export function parseCommaNumber(value: string): number {
    const cleaned = value.replace(/,/g, "").replace(/[^0-9.]/g, "");
    const parsed = Number(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}

// --- Slug Generation ---
export function generateSlug(title: string): string {
    const base = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    return base ? `${base}-${randomSuffix}` : `property-${randomSuffix}`;
}

// --- Form State Defaults & Transformers ---
export const emptyPropertyInput: AdminPropertyInput = {
    name: "",
    price: 0,
    address: "",
    state: "",
    district: "",
    propertyType: "Terrace",
    tenure: "Freehold",
    bumiStatus: "Non Bumi",
    landSize: "",
    builtUp: "",
    bedrooms: 0,
    bathrooms: 0,
    mapsUrl: "",
    description: "",
    status: "Draft",
    images: [],
    outstandingDebt: 0,
    minimumPrice: 0,
    internalNotes: "",
    isAddressHidden: false,
    documents: [],
    furnishing: "Unfurnished",
    tags: [],
};

export function toPropertyInput(property: AdminProperty): AdminPropertyInput {
    return {
        name: property.name || "",
        price: property.price || 0,
        address: property.address || "",
        state: property.state || "",
        district: property.district || "",
        propertyType: property.propertyType || "Terrace",
        tenure: property.tenure || "Freehold",
        bumiStatus: property.bumiStatus || "Non Bumi",
        landSize: property.landSize || "",
        builtUp: property.builtUp || "",
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        mapsUrl: property.mapsUrl || "",
        description: property.description || "",
        status: property.status || "Draft",
        images: Array.isArray(property.images) ? property.images : [],
        outstandingDebt: property.outstandingDebt || 0,
        minimumPrice: property.minimumPrice || 0,
        internalNotes: property.internalNotes || "",
        isAddressHidden: property.isAddressHidden || false,
        documents: Array.isArray(property.documents) ? property.documents : [],
        furnishing: property.furnishing || "Unfurnished",
        tags: Array.isArray(property.tags) ? property.tags : [],
    };
}

// --- Database Mappers ---
export interface PropertyRow {
    id: string;
    title: string;
    description: string | null;
    asking_price: number;
    currency: string;
    state: string;
    district: string | null;
    full_address: string;
    property_type: string;
    category?: string | null;
    tags?: string[] | null;
    bedrooms: number | null;
    bathrooms: number | null;
    area_sqft: number | null;
    built_up_size: string | null;
    land_size: string | null;
    tenure: string | null;
    bumi_status: string | null;
    is_featured: boolean;
    urgent_sale: boolean;
    bidje_score: number | null;
    verified_offer_count: number;
    market_value: number | null;
    max_loan_applicable: number | null;
    minimum_acceptable_price: number | null;
    created_at: string;
    // --- Added DB fields safely ---
    is_address_hidden?: boolean | null;
    google_maps_url?: string | null;
    documents?: string[] | null;
    property_images?: { image_url: string; is_cover: boolean }[];
}

function mapPropertyType(dbType: string, category?: string | null): PropertyCategory {
    const target = (category || dbType).toLowerCase().trim();
    const known: Record<string, PropertyCategory> = {
        land: "land",
        landed: "landed",
        "high-rise": "high-rise",
        "high rise": "high-rise",
        condo: "high-rise",
        apartment: "high-rise",
        commercial: "commercial",
        auction: "auction",
    };
    return known[target] ?? "landed";
}

export function mapPropertyRowToProperty(row: PropertyRow): Property {
    const images = row.property_images?.map((img) => img.image_url) ?? [];
    const cover = row.property_images?.find((img) => img.is_cover);

    return {
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        price: row.asking_price,
        currency: row.currency || "MYR",
        location: [row.district, row.state].filter(Boolean).join(", "),
        category: mapPropertyType(row.property_type, row.category),
        bedrooms: row.bedrooms ?? undefined,
        bathrooms: row.bathrooms ?? undefined,
        areaSqft: row.area_sqft ?? 0,
        imageUrl: cover?.image_url ?? images[0] ?? "",
        featured: row.is_featured,
        createdAt: row.created_at,
        images,
        urgentSale: row.urgent_sale,
        landSize: row.land_size ?? undefined,
        tenure: (row.tenure as TenureType) || undefined,
        bumiStatus: (row.bumi_status as BumiStatusType) || "Unknown",
        bidjeScore: row.bidje_score ?? undefined,
        verifiedOfferCount: row.verified_offer_count ?? 0,
        marketValue: row.market_value ?? undefined,
        maxLoanApplicable: row.max_loan_applicable ?? undefined,
        tags: row.tags ?? [],
        isAddressHidden: Boolean(row.is_address_hidden),
        googleMapsUrl: row.google_maps_url ?? undefined,
        fullAddress: row.full_address ?? undefined,
        district: row.district ?? undefined,
        state: row.state ?? undefined,
        documents: row.documents ?? [],
    };
}

export function mapPropertyRowsToProperties(rows: PropertyRow[]): Property[] {
    return rows.map(mapPropertyRowToProperty);
}