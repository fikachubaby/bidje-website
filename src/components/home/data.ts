import {
  Building2,
  House,
  LandPlot,
  Store,
} from "lucide-react";

export const categories = [
  {
    title: "Landed Properties",
    description: "Terrace, semi-detached, bungalow and cluster homes.",
    icon: House,
    href: "/properties?category=landed",
  },
  {
    title: "High-Rise Properties",
    description: "Apartments, condominiums and serviced residences.",
    icon: Building2,
    href: "/properties?category=high-rise",
  },
  {
    title: "Land for Sale",
    description: "Residential, agricultural and development land.",
    icon: LandPlot,
    href: "/properties?category=land",
  },
  {
    title: "Commercial Properties",
    description: "Shop lots, offices, factories and warehouses.",
    icon: Store,
    href: "/properties?category=commercial",
  },
];

export const properties = [
  {
    id: "1",
    badge: "Urgent Sale",
    title: "2-Storey Terrace",
    location: "Bandar Puteri, Puchong",
    price: "RM 680,000",
    bedrooms: "4",
    bathrooms: "3",
    size: "1,650 sqft",
    offers: "3 verified offers",
    score: 85,
    rating: "Good Buy",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85",
  },
  {
    id: "2",
    badge: "Below Market",
    title: "Modern Condominium",
    location: "Setapak, Kuala Lumpur",
    price: "RM 450,000",
    bedrooms: "3",
    bathrooms: "2",
    size: "900 sqft",
    offers: "5 verified offers",
    score: 78,
    rating: "Good Buy",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=85",
  },
  {
    id: "3",
    badge: "Motivated Seller",
    title: "Agricultural Land",
    location: "Kuala Langat, Selangor",
    price: "RM 780,000",
    bedrooms: "—",
    bathrooms: "—",
    size: "1.4 acres",
    offers: "2 verified offers",
    score: 90,
    rating: "Excellent Buy",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=85",
  },
  {
    id: "4",
    badge: "Commercial",
    title: "3-Storey Shop Lot",
    location: "Kajang, Selangor",
    price: "RM 1,200,000",
    bedrooms: "—",
    bathrooms: "2",
    size: "2,200 sqft",
    offers: "2 verified offers",
    score: 82,
    rating: "Good Buy",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=85",
  },
];

export const statistics = [
  { value: "2,458+", label: "Active Listings" },
  { value: "1,024+", label: "Offers Submitted" },
  { value: "89%", label: "Successful Deals" },
  { value: "100%", label: "Verified Listings" },
];

export const steps = [
  {
    number: "01",
    title: "Find a Property",
    description: "Browse available properties based on location and budget.",
  },
  {
    number: "02",
    title: "Submit an Offer",
    description: "Enter your proposed purchase price and buyer details.",
  },
  {
    number: "03",
    title: "Verify Your Offer",
    description: "Pay the RM500 commitment fee to verify your submission.",
  },
  {
    number: "04",
    title: "Negotiate and Close",
    description: "Bidje manages the negotiation and offer process.",
  },
];
