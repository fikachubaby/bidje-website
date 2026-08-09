export type FurnishingType = "Unfurnished" | "Partially Furnished" | "Fully Furnished";

export const AMENITY_TAGS = [
  "Swimming Pool", "Gymnasium", "24-Hour Security", "Barbecue Area",
  "Playground", "Tennis Court", "Squash Court", "Sauna", "Jogging Track", "Multipurpose Hall"
] as const;
export type AmenityTag = (typeof AMENITY_TAGS)[number];

export const VIEW_TAGS = [
  "KLCC View", "Sea View", "Pool View", "Greenery View", "City View"
] as const;
export type ViewTag = (typeof VIEW_TAGS)[number];

export const FEATURE_TAGS = [
  "Balcony", "Bathtub", "Private Lift", "Dual Key", "Corner Lot", "High Floor", "Renovated"
] as const;
export type FeatureTag = (typeof FEATURE_TAGS)[number];

export type PropertyCategory = "land" | "landed" | "high-rise" | "commercial" | "auction";
export type TenureType = "Freehold" | "Leasehold";
export type BumiStatusType = "Bumi" | "Non Bumi" | "Unknown";
export type OfferStatus = "Pending" | "Accepted" | "Rejected";

export type AdminView =
  | "dashboard" | "properties" | "subscribers" | "offers"
  | "ads" | "imports" | "users" | "audit-logs" | "profile";

export const PROPERTY_TYPES = [
  "Terrace", "Semi-D", "Bungalow", "Apartment", "Condominium", "Shop Lot", "Land"
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_STATUSES = [
  "Draft", "Published", "Under Offer", "Sold", "Active", "Archived"
] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export interface DBProperty {
  id: string;
  title: string;
  asking_price: number;
  full_address: string;
  state: string;
  district?: string | null;
  property_type: PropertyType;
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
  category?: PropertyCategory | null;
  is_featured: boolean;
  internal_notes?: string | null;
  currency: string;
  urgent_sale: boolean;
  bidje_score?: number | null;
  verified_offer_count: number;
  market_value?: number | null;
  max_loan_applicable?: number | null;
  area_sqft?: number | null;
  is_address_hidden?: boolean;
  documents?: string[] | null;
  furnishing?: FurnishingType | null;
  amenities?: AmenityTag[] | null;
  views?: ViewTag[] | null;
  special_features?: FeatureTag[] | null;
  outstanding_debt?: number | null;
  minimum_price?: number | null;
}

export interface DBPropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_cover: boolean;
  display_order: number;
  created_at: string;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  location: string;
  category: PropertyCategory;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  imageUrl?: string;
  images?: string[];
  featured: boolean;
  createdAt: string;
  urgentSale?: boolean;
  landSize?: string;
  tenure?: TenureType;
  bumiStatus?: BumiStatusType;
  bidjeScore?: number;
  verifiedOfferCount?: number;
  marketValue?: number;
  maxLoanApplicable?: number;
  tags?: string[];
}

export interface AdminProperty {
  id: string;
  name: string;
  price: number;
  address: string;
  state: string;
  district?: string;
  propertyType: PropertyType;
  tenure: TenureType;
  bumiStatus: BumiStatusType;
  landSize?: string;
  builtUp?: string;
  bedrooms?: number;
  bathrooms?: number;
  description?: string;
  mapsUrl?: string;
  images: string[];
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
  outstandingDebt?: number;
  minimumPrice?: number;
  internalNotes?: string;
  isAddressHidden?: boolean;
  documents?: string[];
  furnishing?: FurnishingType;
  tags?: string[];
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export type AdminPropertyInput = Omit<
  AdminProperty,
  "id" | "createdAt" | "updatedAt"
>;

export interface CategoryInfo {
  id: PropertyCategory;
  label: string;
  description: string;
  icon: string;
}

export interface BuyerOffer {
  id: string;
  propertyId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  amount: number;
  message: string;
  status: OfferStatus;
  createdAt: string;
}