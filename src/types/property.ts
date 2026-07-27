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
  images?: string[];
  urgentSale?: boolean;
  landSize?: string;
  tenure?: string;
  bumiStatus?: string;
  bidjeScore?: number;
  verifiedOfferCount?: number;
}

export interface CategoryInfo {
  id: PropertyCategory;
  label: string;
  description: string;
  icon: string;
}
