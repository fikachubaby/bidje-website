export type PropertyCategory =
  | "land"
  | "landed"
  | "high-rise"
  | "commercial"
  | "auction";

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  category: PropertyCategory;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft: number;
  imageUrl: string;
  featured: boolean;
  createdAt: string;
}

export interface CategoryInfo {
  id: PropertyCategory;
  label: string;
  description: string;
  icon: string;
}
