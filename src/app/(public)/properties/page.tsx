import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Search, X } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { searchProperties } from "@/lib/properties/property-service";
import { translate as t } from "@/lib/i18n/getTranslation";
import { Pagination } from "@/components/layout/Pagination";

interface PropertiesPageProps {
    searchParams: Promise<{
        state?: string;
        category?: string;
        minPrice?: string;
        maxPrice?: string;
        tag?: string;
        sort?: "newest" | "price_asc" | "price_desc" | "score_desc";
        page?: string;
    }>;
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
    const params = await searchParams;
    const currentPage = params.page ? parseInt(params.page, 10) : 1;

    const { properties, totalCount, totalPages } = await searchProperties({
        location: params.state,
        category: params.category,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        tag: params.tag,
        sortBy: params.sort,
        page: currentPage,
        limit: 9,
    });

    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="bg-white pb-16">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

                    {/* Header */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold text-black">{t("Properties.propertyListing")}</h1>
                            <p className="mt-1 text-sm text-neutral-600">
                                Showing {properties.length} of {totalCount} available properties.
                            </p>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 shadow-sm sm:p-6">
                        <form method="GET" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-neutral-500">Location</label>
                                <input
                                    type="text"
                                    name="state"
                                    defaultValue={params.state || ""}
                                    placeholder="Location..."
                                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-neutral-500">Category</label>
                                <select
                                    name="category"
                                    defaultValue={params.category || ""}
                                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm"
                                >
                                    <option value="">All Categories</option>
                                    <option value="landed">Landed</option>
                                    <option value="high-rise">High Rise</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="land">Land</option>
                                    <option value="auction">Auction</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase text-neutral-500">Sort By</label>
                                <select
                                    name="sort"
                                    defaultValue={params.sort || "newest"}
                                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="score_desc">Highest Investment Score</option>
                                </select>
                            </div>

                            <div className="flex items-end gap-2">
                                <button type="submit" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">
                                    <Search className="h-4 w-4" /> Apply
                                </button>
                                {(params.state || params.category || params.sort || params.tag) && (
                                    <Link href="/properties" className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-600">
                                        <X className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Results Grid */}
                    {properties.length === 0 ? (
                        <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                            <p className="text-lg font-semibold">No properties found</p>
                        </div>
                    ) : (
                        <>
                            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {properties.map((property) => (
                                    <PropertyCard key={property.id} property={property} />
                                ))}
                            </div>

                            {/* Reusable Pagination Controls */}
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                baseUrl="/properties"
                                searchParams={params}
                            />
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}