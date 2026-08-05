export type PropertyCategory =
  | "land"
  | "landed"
  | "high-rise"
  | "commercial"
  | "auction";

export type TenureType = "Freehold" | "Leasehold";
export type BumiStatusType = "Bumi" | "Non Bumi" | "Unknown";
export type PropertyStatus = "Draft" | "Active" | "Sold" | "Archived";

// Strict database record definition matching public.properties
export interface DBProperty {
  id: string;
  title: string;
  asking_price: number;
  full_address: string;
  state: string;
  district?: string | null;
  property_type: string;
  tenure: TenureType;
  bumi_status: BumiStatusType;
  land_size?: string | null;
  built_up_size?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  description?: string | null;
  google_maps_url?: string | null;
  created_by?: string | null;
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
  slug?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  tags?: string[] | null;
  category?: PropertyCategory | string | null;
  is_featured: boolean;
  internal_notes?: string | null;
  currency: string;
  urgent_sale: boolean;
  bidje_score?: number | null;
  verified_offer_count: number;
  market_value?: number | null;
  max_loan_applicable?: number | null;
  area_sqft?: number | null;
}

// Database record definition for public.property_images
export interface DBPropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_cover: boolean;
  display_order: number;
  created_at: string;
}

// Existing combined UI model for frontend rendering
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
  areaSqft?: number;
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
  marketValue?: number;
  maxLoanApplicable?: number;
}

export interface CategoryInfo {
  id: PropertyCategory;
  label: string;
  description: string;
  icon: string;
}