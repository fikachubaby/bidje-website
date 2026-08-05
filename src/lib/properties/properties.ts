import { supabase } from "@/lib/supabase/supabase";
import {
  mapPropertyRowsToProperties,
  mapPropertyRowToProperty,
  type PropertyRow,
} from "@/lib/properties/property-mapper";
import type { Property, PropertyCategory } from "@/types/property";

const PROPERTY_SELECT = "*, property_images(image_url, is_cover)";

export async function getFeaturedProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("status", "Published")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    console.error("getFeaturedProperties error:", error.message);
    return [];
  }

  return mapPropertyRowsToProperties(data as PropertyRow[]);
}

export async function getLatestListings(limit = 6): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("status", "Published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getLatestListings error:", error.message);
    return [];
  }

  return mapPropertyRowsToProperties(data as PropertyRow[]);
}

export async function getPropertiesByCategory(
  category: PropertyCategory
): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("status", "Published")
    .ilike("property_type", category)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPropertiesByCategory error:", error.message);
    return [];
  }

  return mapPropertyRowsToProperties(data as PropertyRow[]);
}

export async function getPropertyById(
  id: string
): Promise<Property | undefined> {
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

export async function searchProperties(query: {
  location?: string;
  category?: PropertyCategory;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Property[]> {
  let builder = supabase
    .from("properties")
    .select(PROPERTY_SELECT)
    .eq("status", "Published");

  if (query.location) {
    // Matches against state, district, or full_address
    builder = builder.or(
      `state.ilike.%${query.location}%,district.ilike.%${query.location}%,full_address.ilike.%${query.location}%`
    );
  }

  if (query.category) {
    builder = builder.ilike("property_type", query.category);
  }

  if (query.minPrice !== undefined) {
    builder = builder.gte("asking_price", query.minPrice);
  }

  if (query.maxPrice !== undefined) {
    builder = builder.lte("asking_price", query.maxPrice);
  }

  const { data, error } = await builder.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("searchProperties error:", error.message);
    return [];
  }

  return mapPropertyRowsToProperties(data as PropertyRow[]);
}