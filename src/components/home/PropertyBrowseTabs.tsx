"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Building2, Flame, AlertTriangle, MapPin, BedDouble, Bath, Ruler, ArrowUpRight } from "lucide-react";

type TabKey = "type" | "hot" | "urgent";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "type", label: "Property Type", icon: Building2 },
    { key: "hot", label: "Hot Deals", icon: Flame },
    { key: "urgent", label: "Urgent Sales", icon: AlertTriangle },
];

// Replace this with your real data source (API call / props / server fetch)
interface PropertyCard {
    id: string;
    title: string;
    location: string;
    price: number;
    beds: number;
    baths: number;
    sqft: number;
    image: string;
    tag: TabKey; // which tab this listing belongs under
}

const SAMPLE_PROPERTIES: PropertyCard[] = [
    // TODO: swap for real listings (fetched or passed in as props)
];

function formatPrice(price: number) {
    return `RM ${price.toLocaleString()}`;
}

export function PropertyBrowseTabs({ properties = SAMPLE_PROPERTIES }: { properties?: PropertyCard[] }) {
    const [activeTab, setActiveTab] = useState<TabKey>("type");

    const filtered = useMemo(
        () => properties.filter((p) => p.tag === activeTab),
        [properties, activeTab]
    );

    return (
        <section className="bg-white py-16 sm:py-24 border-b border-neutral-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
                        Browse Properties
                    </h2>
                    <p className="mt-2 max-w-xl text-base text-neutral-600">
                        Explore listings by type, hot deals, or urgent sales starting from RM100K.
                    </p>
                </div>

                {/* Tab buttons */}
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

                {/* Listings grid */}
                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.length === 0 && (
                        <p className="col-span-full text-center text-sm text-neutral-500">
                            No listings available in this category yet.
                        </p>
                    )}

                    {filtered.map((property) => (
                        <Link
                            key={property.id}
                            href={`/properties/${property.id}`}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                        >
                            <div
                                className="h-44 w-full bg-neutral-100 bg-cover bg-center"
                                style={{ backgroundImage: `url(${property.image})` }}
                            />
                            <div className="flex flex-1 flex-col p-4">
                                <span className="text-lg font-extrabold text-black">
                                    {formatPrice(property.price)}
                                </span>
                                <h3 className="mt-1 line-clamp-1 text-sm font-bold text-neutral-800">
                                    {property.title}
                                </h3>
                                <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {property.location}
                                </div>
                                <div className="mt-3 flex items-center gap-4 border-t border-neutral-100 pt-3 text-xs text-neutral-600">
                                    <span className="flex items-center gap-1">
                                        <BedDouble className="h-3.5 w-3.5" /> {property.beds}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Bath className="h-3.5 w-3.5" /> {property.baths}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Ruler className="h-3.5 w-3.5" /> {property.sqft} sqft
                                    </span>
                                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-black opacity-0 transition-opacity group-hover:opacity-100" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}