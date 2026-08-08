import type { Property, PropertyCategory } from "@/types/property";

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
    property_images?: { image_url: string; is_cover: boolean }[];
}

function mapPropertyType(dbType: string): PropertyCategory {
    const normalized = dbType.toLowerCase().trim();
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
    return known[normalized] ?? "landed";
}

export function mapPropertyRowToProperty(row: PropertyRow): Property {
    const images = row.property_images?.map((img) => img.image_url) ?? [];
    const cover = row.property_images?.find((img) => img.is_cover);

    return {
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        price: row.asking_price,
        currency: row.currency,
        location: [row.district, row.state].filter(Boolean).join(", "),
        category: mapPropertyType(row.property_type),
        bedrooms: row.bedrooms ?? undefined,
        bathrooms: row.bathrooms ?? undefined,
        areaSqft: row.area_sqft ?? 0,
        imageUrl: cover?.image_url ?? images[0] ?? "",
        featured: row.is_featured,
        createdAt: row.created_at,
        images,
        urgentSale: row.urgent_sale,
        landSize: row.land_size ?? undefined,
        tenure: row.tenure ?? undefined,
        bumiStatus: row.bumi_status ?? undefined,
        bidjeScore: row.bidje_score ?? undefined,
        verifiedOfferCount: row.verified_offer_count,
        marketValue: row.market_value ?? undefined,
        maxLoanApplicable: row.max_loan_applicable ?? undefined,
        minimumPrice: row.minimum_acceptable_price ?? undefined,
    };
}

export function mapPropertyRowsToProperties(rows: PropertyRow[]): Property[] {
    return rows.map(mapPropertyRowToProperty);
}