import type { AdminProperty, AdminPropertyInput, BuyerOffer } from "@/types/admin";

export const PROPERTIES_KEY = "bidje-admin-properties-v2";
export const OFFERS_KEY = "bidje-admin-offers-v2";

const now = () => new Date().toISOString();

export const defaultProperties: AdminProperty[] = [
  {
    id: "PROP-1001",
    name: "Modern Terrace House in Kajang",
    price: 380000,
    address: "Jalan Semenyih, Taman Kajang Perdana",
    state: "Selangor",
    district: "Kajang",
    propertyType: "Terrace",
    tenure: "Freehold",
    bumiStatus: "Non Bumi",
    landSize: "20 x 70 ft",
    builtUp: "1,650 sqft",
    bedrooms: 4,
    bathrooms: 3,
    description:
      "Well-kept family home near schools, shops and major highways. Ideal for owner-occupiers.",
    mapsUrl: "https://maps.google.com",
    images: [],
    status: "Published",
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "PROP-1002",
    name: "Double Storey Home in Klang",
    price: 520000,
    address: "Jalan Batu Tiga Lama, Bandar Bukit Tinggi",
    state: "Selangor",
    district: "Klang",
    propertyType: "Semi-D",
    tenure: "Leasehold",
    bumiStatus: "Bumi",
    landSize: "32 x 70 ft",
    builtUp: "2,050 sqft",
    bedrooms: 4,
    bathrooms: 3,
    description:
      "Spacious home with renovation potential and easy access to town centre.",
    mapsUrl: "",
    images: [],
    status: "Draft",
    createdAt: now(),
    updatedAt: now(),
  },
];

export const defaultOffers: BuyerOffer[] = [
  {
    id: "OFF-251",
    propertyId: "PROP-1001",
    buyerName: "Ahmad Firdaus",
    buyerPhone: "+60123456789",
    buyerEmail: "ahmad@example.com",
    amount: 355000,
    message: "Interested in viewing this weekend. Flexible on completion date.",
    status: "Pending",
    createdAt: now(),
  },
  {
    id: "OFF-252",
    propertyId: "PROP-1001",
    buyerName: "Sarah Lim",
    buyerPhone: "+60198765432",
    buyerEmail: "sarah.lim@example.com",
    amount: 365000,
    message: "Cash buyer, can proceed quickly.",
    status: "Pending",
    createdAt: now(),
  },
];

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

/** Migrate legacy v1 records that used `title` and `imageUrl`. */
function normalizeProperty(record: Record<string, unknown>): AdminProperty {
  const ts = now();
  return {
    id: String(record.id ?? makeId("PROP")),
    name: String(record.name ?? record.title ?? ""),
    price: Number(record.price ?? 0),
    address: String(record.address ?? ""),
    state: String(record.state ?? ""),
    district: String(record.district ?? ""),
    propertyType: (record.propertyType ?? record.type ?? "Terrace") as AdminProperty["propertyType"],
    tenure: (record.tenure ?? "Freehold") as AdminProperty["tenure"],
    bumiStatus: (record.bumiStatus ?? "Non Bumi") as AdminProperty["bumiStatus"],
    landSize: String(record.landSize ?? ""),
    builtUp: String(record.builtUp ?? ""),
    bedrooms: Number(record.bedrooms ?? 0),
    bathrooms: Number(record.bathrooms ?? 0),
    description: String(record.description ?? ""),
    mapsUrl: String(record.mapsUrl ?? ""),
    images: Array.isArray(record.images)
      ? (record.images as string[])
      : record.imageUrl
        ? [String(record.imageUrl)]
        : [],
    status: (record.status ?? "Draft") as AdminProperty["status"],
    createdAt: String(record.createdAt ?? ts),
    updatedAt: String(record.updatedAt ?? ts),
  };
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString().slice(-7)}`;
}

export function loadProperties(): AdminProperty[] {
  const stored = readJson<Record<string, unknown>[]>(PROPERTIES_KEY);
  if (stored?.length) {
    return stored.map(normalizeProperty);
  }

  const legacy = readJson<Record<string, unknown>[]>("bidje-admin-properties-v1");
  if (legacy?.length) {
    const migrated = legacy.map(normalizeProperty);
    saveProperties(migrated);
    return migrated;
  }

  return defaultProperties;
}

export function saveProperties(properties: AdminProperty[]): void {
  writeJson(PROPERTIES_KEY, properties);
}

export function loadOffers(): BuyerOffer[] {
  const stored = readJson<BuyerOffer[]>(OFFERS_KEY);
  if (stored?.length) return stored;

  const legacy = readJson<BuyerOffer[]>("bidje-admin-offers-v1");
  if (legacy?.length) {
    saveOffers(legacy);
    return legacy;
  }

  return defaultOffers;
}

export function saveOffers(offers: BuyerOffer[]): void {
  writeJson(OFFERS_KEY, offers);
}

export function createProperty(input: AdminPropertyInput): AdminProperty {
  const ts = now();
  return { ...input, id: makeId("PROP"), createdAt: ts, updatedAt: ts };
}

export function updateProperty(
  existing: AdminProperty,
  input: AdminPropertyInput
): AdminProperty {
  return { ...existing, ...input, updatedAt: now() };
}

export function toPropertyInput(property: AdminProperty): AdminPropertyInput {
  return {
    name: property.name,
    price: property.price,
    address: property.address,
    state: property.state,
    district: property.district,
    propertyType: property.propertyType,
    tenure: property.tenure,
    bumiStatus: property.bumiStatus,
    landSize: property.landSize,
    builtUp: property.builtUp,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    description: property.description,
    mapsUrl: property.mapsUrl,
    images: property.images,
    status: property.status,
  };
}

export const emptyPropertyInput: AdminPropertyInput = {
  name: "",
  price: 0,
  address: "",
  state: "",
  district: "",
  propertyType: "Terrace",
  tenure: "Freehold",
  bumiStatus: "Non Bumi",
  landSize: "",
  builtUp: "",
  bedrooms: 3,
  bathrooms: 2,
  description: "",
  mapsUrl: "",
  images: [],
  status: "Draft",
};
