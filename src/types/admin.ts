export type PropertyStatus = "Draft" | "Published" | "Under Offer" | "Sold";

export type OfferStatus = "Pending" | "Accepted" | "Rejected";

export type TenureType = "Freehold" | "Leasehold";

export type BumiStatus = "Bumi" | "Non Bumi";

export type PropertyType =
  | "Terrace"
  | "Semi-D"
  | "Bungalow"
  | "Apartment"
  | "Condominium"
  | "Shop Lot"
  | "Land";

export interface AdminProperty {
  id: string;
  name: string;
  price: number;
  address: string;
  state: string;
  district: string;
  propertyType: PropertyType;
  tenure: TenureType;
  bumiStatus: BumiStatus;
  landSize: string;
  builtUp: string;
  bedrooms: number;
  bathrooms: number;
  description: string;
  mapsUrl: string;
  images: string[];
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

export type AdminPropertyInput = Omit<
  AdminProperty,
  "id" | "createdAt" | "updatedAt"
>;

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

export type AdminView = "dashboard" | "properties" | "offers" | "imports";
