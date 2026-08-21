"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
    Building2, Flame, AlertTriangle, MapPin,
    BedDouble, Bath, Ruler, ArrowUpRight, ImageOff,
} from "lucide-react";
import type {
    DBProperty,
    DBPropertyImage,
    PropertyType,
} from "@/types/property";
import { PROPERTY_TYPES } from "@/types/property";
import { isHotDeal } from "@/lib/utils/score";

type TabKey = "type" | "hot" | "urgent";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "type", label: "Property Type", icon: Building2 },
    { key: "hot", label: "Hot Deals", icon: Flame },
    { key: "urgent", label: "Urgent Sales", icon: AlertTriangle },
];

export type RawBrowseProperty = Pick<
DBProperty,
    | "id"
    | "title"
    | "asking_price"
    | "full_address"
    | "state"
    | "district"
    | "property_type"
    | "area_sqft"
    | "bedrooms"
    | "bathrooms"
    | "is_featured"
    | "urgent_sale"
    | "status"
    | "slug"
    | "bidje_score"
    > & {
        property_images?: Pick < DBPropertyImage, "image_url" | "is_cover" | "display_order" > [] | null;
    };

function getHotDeals(properties: RawBrowseProperty[], limit = 9) {
    const goodBuys = properties.filter((p) => isHotDeal(p.bidje_score));

    if (goodBuys.length >= 3) {
        return [...goodBuys]
            .sort((a, b) => (b.bidje_score ?? 0) - (a.bidje_score ?? 0))
            .slice(0, limit);
    }

    const withPsf = properties
        .filter((p) => p.area_sqft && p.area_sqft > 0)
        .map((p) => ({ ...p, psf: p.asking_price / (p.area_sqft as number) }));

    const avgByType = new Map<string, number>();
    for (const type of new Set(withPsf.map((p) => p.property_type))) {
        const inType = withPsf.filter((p) => p.property_type === type);
        avgByType.set(type, inType.reduce((sum, p) => sum + p.psf, 0) / inType.length);
    }

    return withPsf
        .filter((p) => p.psf < (avgByType.get(p.property_type) ?? Infinity) * 0.9)
        .sort((a, b) => a.psf - b.psf)
        .slice(0, limit);
}

function formatPrice(price: number) {
    return `RM ${price.toLocaleString()}`;
}

function coverImageUrl(images?: RawBrowseProperty["property_images"]) {
    if (!images || images.length === 0) return null;
    const cover = images.find((img) => img.is_cover) ?? images[0];
    return cover?.image_url ?? null;
}

function NoImagePlaceholder() {
    return (
        <div className="flex h-44 w-full flex-col items-center justify-center gap-1.5 bg-neutral-100 text-neutral-400">
            <ImageOff className="h-6 w-6" />
            <span className="text-[11px] font-semibold uppercase tracking-wide">No Image Available</span>
        </div>
    );
}

export function PropertyBrowseTabs({ properties = [] }: { properties?: RawBrowseProperty[] }) {
    const [activeTab, setActiveTab] = useState<TabKey>("type");
    const [activeType, setActiveType] = useState<PropertyType | "All">("All");

    const availableTypes = useMemo(() => {
        const present = new Set(properties.map((p) => p.property_type));
        return PROPERTY_TYPES.filter((t) => present.has(t));
    }, [properties]);

    const filtered = useMemo(() => {
        if (activeTab === "urgent") {
            return properties.filter((p) => p.urgent_sale);
        }
        if (activeTab === "hot") {
            return getHotDeals(properties);
        }
        return activeType === "All"
            ? properties
            : properties.filter((p) => p.property_type === activeType);
    }, [properties, activeTab, activeType]);

    return (
        <section className="bg-white py-16 sm:py-24 border-b border-neutral-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
                        Browse Properties
                    </h2>
                    <p className="mt-2 max-w-xl text-base text-neutral-600">
                        Explore listings by type, hot deals, or urgent sales starting from RM100K.
                    </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-colors ${isActive
                                    ? "border-black bg-black text-white"
                                    : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {activeTab === "type" && availableTypes.length > 0 && (
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        <button
                            onClick={() => setActiveType("All")}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${activeType === "All"
                                ? "bg-[#ffd400] text-black"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                        >
                            All Types
                        </button>
                        {availableTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setActiveType(type)}
                                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${activeType === type
                                    ? "bg-[#ffd400] text-black"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.length === 0 && (
                        <p className="col-span-full text-center text-sm text-neutral-500">
                            No listings available in this category yet.
                        </p>
                    )}

                    {filtered.slice(0, 9).map((property) => {
                        const imageUrl = coverImageUrl(property.property_images);
                        return (
                            <Link
                                key={property.id}
                                href={`/properties/${property.slug || property.id}`}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >
                                {imageUrl ? (
                                    <div
                                        className="h-44 w-full bg-neutral-100 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${imageUrl})` }}
                                    />
                                ) : (
                                    <NoImagePlaceholder />
                                )}
                                <div className="flex flex-1 flex-col p-4">
                                    <span className="text-lg font-extrabold text-black">
                                        {formatPrice(property.asking_price)}
                                    </span>
                                    <h3 className="mt-1 line-clamp-1 text-sm font-bold text-neutral-800">
                                        {property.title}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {property.district ? `${property.district}, ` : ""}{property.state}
                                    </div>
                                    <div className="mt-3 flex items-center gap-4 border-t border-neutral-100 pt-3 text-xs text-neutral-600">
                                        <span className="flex items-center gap-1">
                                            <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms ?? "-"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Bath className="h-3.5 w-3.5" /> {property.bathrooms ?? "-"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Ruler className="h-3.5 w-3.5" /> {property.area_sqft ?? "-"} sqft
                                        </span>
                                        <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-black opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}