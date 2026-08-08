import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { searchProperties } from "@/lib/properties/properties";
import type { PropertyCategory } from "@/types/property";
import { translate as t } from "@/lib/i18n/getTranslation";

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
                            <h1 className="text-3xl font-extrabold text-black">{t("Properties.propertyListing")}</h1>
                            <p className="mt-1 text-neutral-600">
                                Browse verified properties and submit transparent offers.
                            </p>
                        </div>
                    </div>

                    {/* Filter Bar Form */}
                    <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 shadow-sm sm:p-6">
                        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-black">
                            <SlidersHorizontal className="h-4 w-4 text-black" />
                            {t("Properties.search.filterSearch")}
                        </div>

                        <form method="GET" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Location / Search query */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    {t("Properties.fields.location")}
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
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                                    {t("Properties.fields.category")}
                                </label>
                                <select
                                    name="category"
                                    defaultValue={params.category || ""}
                                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm text-black focus:border-black focus:outline-none"
                                >
                                    <option value="">{t("Properties.fields.category")}</option>
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="industrial">Industrial</option>
                                    <option value="land">Land</option>
                                </select>
                            </div>

                            {/* Max Price Filter */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
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
                            {properties.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}