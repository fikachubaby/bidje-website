import { supabase } from "@/lib/supabase/supabase";
import {
    mapPropertyRowsToProperties,
    mapPropertyRowToProperty,
    type PropertyRow,
} from "@/lib/utils/property-utils";
import type { Property, PropertyCategory } from "@/types/property";

const PROPERTY_SELECT = "*, property_images(image_url, is_cover)";

export interface PropertySearchParams {
    location?: string;
    category?: PropertyCategory | string;
    minPrice?: number;
    maxPrice?: number;
    tag?: string;
    bedrooms?: number;
    isFeatured?: boolean;
    page?: number;
    limit?: number;
    sortBy?: "newest" | "price_asc" | "price_desc" | "score_desc";
}

export interface PaginatedPropertiesResult {
    properties: Property[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
}

export interface PSEOLocationFilterParams {
    state?: string;
    district?: string;
    category?: string;
    page?: number;
    limit?: number;
    sortBy?: "newest" | "price_asc" | "price_desc" | "score_desc";
}

export async function getFeaturedProperties(limit = 4): Promise<Property[]> {
    const { data, error } = await supabase
        .from("properties")
        .select(PROPERTY_SELECT)
        .eq("status", "Published")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("getFeaturedProperties error:", error.message);
        return [];
    }

    return mapPropertyRowsToProperties((data as PropertyRow[]) || []);
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
    const { data, error } = await supabase
        .from("properties")
        .select(PROPERTY_SELECT)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        console.error("getPropertyById error:", error.message);
        return undefined;
    }

    if (!data) return undefined;

    return mapPropertyRowToProperty(data as PropertyRow);
}

export async function searchProperties(
    params: PropertySearchParams
): Promise<PaginatedPropertiesResult> {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 9;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let builder = supabase
        .from("properties")
        .select(PROPERTY_SELECT, { count: "exact" })
        .eq("status", "Published");

    if (params.location) {
        builder = builder.or(
            `state.ilike.%${params.location}%,district.ilike.%${params.location}%,full_address.ilike.%${params.location}%`
        );
    }

    if (params.category) {
        builder = builder.or(
            `category.ilike.%${params.category}%,property_type.ilike.%${params.category}%`
        );
    }

    if (params.minPrice !== undefined) builder = builder.gte("asking_price", params.minPrice);
    if (params.maxPrice !== undefined) builder = builder.lte("asking_price", params.maxPrice);
    if (params.bedrooms !== undefined) builder = builder.gte("bedrooms", params.bedrooms);
    if (params.tag) builder = builder.contains("tags", [params.tag]);
    if (params.isFeatured) builder = builder.eq("is_featured", true);

    switch (params.sortBy) {
        case "price_asc":
            builder = builder.order("asking_price", { ascending: true });
            break;
        case "price_desc":
            builder = builder.order("asking_price", { ascending: false });
            break;
        case "score_desc":
            builder = builder.order("bidje_score", { ascending: false, nullsFirst: false });
            break;
        case "newest":
        default:
            builder = builder.order("created_at", { ascending: false });
            break;
    }

    const { data, count, error } = await builder.range(from, to);

    if (error) {
        console.error("searchProperties error:", error.message);
        return { properties: [], totalCount: 0, totalPages: 0, currentPage: page };
    }

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
        properties: mapPropertyRowsToProperties((data as PropertyRow[]) || []),
        totalCount,
        totalPages,
        currentPage: page,
    };
}

export async function getFilteredProperties(
    filters: PSEOLocationFilterParams
): Promise<PaginatedPropertiesResult> {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 9;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from("properties")
        .select(PROPERTY_SELECT, { count: "exact" })
        .eq("status", "Published");

    if (filters.state) {
        query = query.ilike("state", filters.state.replace(/-/g, " "));
    }
    if (filters.district) {
        query = query.ilike("district", filters.district.replace(/-/g, " "));
    }
    if (filters.category) {
        const fc = filters.category.replace(/-/g, " ");
        query = query.or(`category.ilike.${fc},property_type.ilike.${fc}`);
    }

    switch (filters.sortBy) {
        case "price_asc":
            query = query.order("asking_price", { ascending: true });
            break;
        case "price_desc":
            query = query.order("asking_price", { ascending: false });
            break;
        case "score_desc":
            query = query.order("bidje_score", { ascending: false, nullsFirst: false });
            break;
        case "newest":
        default:
            query = query.order("created_at", { ascending: false });
            break;
    }

    const { data, count, error } = await query.range(from, to);

    if (error) {
        console.error("getFilteredProperties error:", error.message);
        return { properties: [], totalCount: 0, totalPages: 0, currentPage: page };
    }

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
        properties: mapPropertyRowsToProperties((data as PropertyRow[]) || []),
        totalCount,
        totalPages,
        currentPage: page,
    };
}