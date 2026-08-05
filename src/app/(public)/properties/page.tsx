import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { SlidersHorizontal, MapPin, Bed, Bath, Maximize, Search, X } from "lucide-react";
import { searchProperties } from "@/lib/properties/properties";
import type { PropertyCategory } from "@/types/property";
import { formatArea, formatPrice, formatCategory } from "@/lib/utils";

interface PropertiesPageProps {
    searchParams: Promise<{
        state?: string;
        district?: string;
        category?: string;
        minPrice?: string;
        maxPrice?: string;
        sort?: string;
    }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
    const params = await searchParams;

    const properties = await searchProperties({
        location: params.district || params.state,
        category: params.category as PropertyCategory | undefined,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    });

    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="bg-white pb-16">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

                    {/* Header & Title */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold text-black">Property Listings</h1>
                            <p className="mt-1 text-neutral-600">
                                Browse verified properties and submit transparent offers.
                            </p>
                        </div>
                    </div>

                    {/* Filter Bar Form */}
                    <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 sm:p-6 shadow-sm">
                        <div className="flex items-center gap-2 text-sm font-semibold text-black mb-4">
                            <SlidersHorizontal className="h-4 w-4 text-brand-dark" />
                            Filter & Search
                        </div>

                        <form method="GET" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Location / Search query */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    defaultValue={params.state || ""}
                                    placeholder="e.g. Kuala Lumpur, Selangor"
                                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:outline-none"
                                />
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    defaultValue={params.category || ""}
                                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm text-black focus:border-black focus:outline-none"
                                >
                                    <option value="">All Categories</option>
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="industrial">Industrial</option>
                                    <option value="land">Land</option>
                                </select>
                            </div>

                            {/* Max Price Filter */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">
                                    Max Price (MYR)
                                </label>
                                <input
                                    type="number"
                                    name="maxPrice"
                                    defaultValue={params.maxPrice || ""}
                                    placeholder="e.g. 1000000"
                                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:outline-none"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-end gap-2">
                                <button
                                    type="submit"
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                                >
                                    <Search className="h-4 w-4" />
                                    Apply
                                </button>
                                {(params.state || params.category || params.maxPrice) && (
                                    <Link
                                        href="/properties"
                                        className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black"
                                        title="Reset Filters"
                                    >
                                        <X className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Results Grid */}
                    {properties.length === 0 ? (
                        <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                            <p className="text-lg font-semibold text-black">No properties found</p>
                            <p className="mt-1 text-sm text-neutral-500">
                                Try adjusting your filters or search criteria to find what you&apos;re looking for.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {properties.map((property) => {
                                const image = property.images?.[0] || property.imageUrl;
                                return (
                                    <Link
                                        key={property.id}
                                        href={`/properties/${property.id}`}
                                        className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-md"
                                    >
                                        {/* Property Image Container */}
                                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                                            {image ? (
                                                <Image
                                                    src={image}
                                                    alt={property.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-neutral-400">
                                                    No image
                                                </div>
                                            )}
                                            {property.urgentSale && (
                                                <span className="absolute top-3 left-3 z-10 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                                    Urgent Sale
                                                </span>
                                            )}
                                        </div>

                                        {/* Card Content */}
                                        <div className="flex flex-1 flex-col p-5">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                                {formatCategory(property.category)}
                                            </p>
                                            <p className="mt-1 text-2xl font-extrabold text-black">
                                                {formatPrice(property.price, property.currency)}
                                            </p>

                                            <h2 className="mt-2 line-clamp-1 text-base font-bold text-black group-hover:text-brand-dark">
                                                {property.title}
                                            </h2>

                                            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-neutral-600">
                                                <MapPin className="h-4 w-4 shrink-0 text-brand-dark" />
                                                <span className="line-clamp-1">{property.location}</span>
                                            </p>

                                            {/* Specs Footer */}
                                            <div className="mt-4 flex items-center gap-3 border-t border-neutral-100 pt-4 text-xs font-medium text-neutral-600">
                                                {property.bedrooms !== undefined && (
                                                    <span className="flex items-center gap-1">
                                                        <Bed className="h-3.5 w-3.5 text-neutral-400" />
                                                        {property.bedrooms} Bed
                                                    </span>
                                                )}
                                                {property.bathrooms !== undefined && (
                                                    <span className="flex items-center gap-1">
                                                        <Bath className="h-3.5 w-3.5 text-neutral-400" />
                                                        {property.bathrooms} Bath
                                                    </span>
                                                )}
                                                {property.areaSqft !== undefined && (
                                                    <span className="flex items-center gap-1">
                                                        <Maximize className="h-3.5 w-3.5 text-neutral-400" />
                                                        {formatArea(property.areaSqft)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}