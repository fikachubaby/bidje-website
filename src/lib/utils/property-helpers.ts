// src/lib/utils/property-helpers.ts
import type { AdminProperty, AdminPropertyInput } from "@/types/property";

export const emptyPropertyInput: AdminPropertyInput = {
    name: "",
    price: 0,
    address: "",
    state: "",
    district: "",
    propertyType: "Terrace",
    tenure: "Freehold",
    bumiStatus: "Bumi",
    landSize: "",
    builtUp: "",
    bedrooms: 0,
    bathrooms: 0,
    mapsUrl: "",
    description: "",
    status: "Draft",
    images: [],
    outstandingDebt: 0,
    minimumPrice: 0,
};

export function toPropertyInput(property: AdminProperty): AdminPropertyInput {
    return {
        name: property.name || "",
        price: property.price || 0,
        address: property.address || "",
        state: property.state || "",
        district: property.district || "",
        propertyType: property.propertyType || "Terrace",
        tenure: property.tenure || "Freehold",
        bumiStatus: property.bumiStatus || "Bumi",
        landSize: property.landSize || "",
        builtUp: property.builtUp || property.builtUp || "",
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        mapsUrl: property.mapsUrl || "",
        description: property.description || "",
        status: property.status || "Draft",
        images: Array.isArray(property.images) ? property.images : [],
        outstandingDebt: property.outstandingDebt || 0,
        minimumPrice: property.minimumPrice || 0,
    };
}