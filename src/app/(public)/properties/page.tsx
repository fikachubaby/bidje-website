import { Navbar } from "@/components/layout/Navbar";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertySearchFilter } from "@/components/property/PropertySearchFilter";
import { searchProperties } from "@/lib/properties/property-service";
import { translate as t } from "@/lib/i18n/getTranslation";
import { Pagination } from "@/components/layout/Pagination";

interface PropertiesPageProps {
    searchParams: Promise<{
        state?: string;
        district?: string;
        category?: string;
        property_type?: string;
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
    const resolvedPropertyType = params.property_type || params.category;

    const { properties, totalCount, totalPages } = await searchProperties({
        location: params.district || params.state,
        property_type: resolvedPropertyType,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        sortBy: params.sort,
        page: currentPage,
        limit: 9,
    });

    // Build the dynamic subtitle suffix based on selected filters
    let listingSubtitle = "";
    if (params.district && params.state) {
        listingSubtitle = ` in ${params.district}, ${params.state}`;
    } else if (params.state) {
        listingSubtitle = ` in ${params.state}`;
    }

    if (resolvedPropertyType) {
        listingSubtitle += ` of ${resolvedPropertyType}`;
    }

    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="bg-white pb-16">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

                    {/* Header */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold text-black">
                                {t("Properties.propertyListing")}
                                <span className="font-normal text-neutral-700">{listingSubtitle}</span>
                            </h1>
                            <p className="mt-1 text-sm text-neutral-600">
                                Showing {properties.length} of {totalCount} available properties.
                            </p>
                        </div>
                    </div>

                    {/* Reusable State, District, & Property Type Search Filter */}
                    <PropertySearchFilter
                        initialState={params.state}
                        initialDistrict={params.district}
                        initialPropertyType={resolvedPropertyType}
                        initialSort={params.sort}
                    />

                    {/* Results Grid */}
                    {properties.length === 0 ? (
                        <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                            <p className="text-lg font-semibold">No properties found matching your selection.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {properties.map((property) => (
                                    <PropertyCard key={property.id} property={property} />
                                ))}
                            </div>

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