import { mockProperties } from "@/data/mock-properties";
import type { Property, PropertyCategory } from "@/types/property";

export async function getFeaturedProperties(): Promise<Property[]> {
  return mockProperties.filter((p) => p.featured).slice(0, 4);
}

export async function getLatestListings(limit = 6): Promise<Property[]> {
  return [...mockProperties]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

export async function getPropertiesByCategory(
  category: PropertyCategory
): Promise<Property[]> {
  return mockProperties.filter((p) => p.category === category);
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  return mockProperties.find((p) => p.id === id);
}

export async function searchProperties(query: {
  location?: string;
  category?: PropertyCategory;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Property[]> {
  return mockProperties.filter((p) => {
    if (
      query.location &&
      !p.location.toLowerCase().includes(query.location.toLowerCase())
    ) {
      return false;
    }
    if (query.category && p.category !== query.category) {
      return false;
    }
    if (query.minPrice && p.price < query.minPrice) {
      return false;
    }
    if (query.maxPrice && p.price > query.maxPrice) {
      return false;
    }
    return true;
  });
}
