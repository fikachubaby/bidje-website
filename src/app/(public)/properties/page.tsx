import { Navbar } from "@/components/layout/Navbar";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertySearchFilter } from "@/components/property/PropertySearchFilter";
import { PropertiesPagePagination } from "@/components/property/PropertiesPagePagination";
import { searchProperties } from "@/lib/properties/property-service";
import { translate as t } from "@/lib/i18n/getTranslation";

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
    const pageSize = 9;

    const searchString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
            if (value !== undefined) acc[key] = String(value);
            return acc;
        }, {} as Record<string, string>)
    ).toString();

    const { properties, totalCount, totalPages } = await searchProperties({
        location: params.district || params.state,
        property_type: resolvedPropertyType,
        minPrice: params.minPrice ? Number(params.minPrice) : undefined,
        maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
        sortBy: params.sort,
        page: currentPage,
        limit: pageSize,
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
            <section className="bg-white py-12 sm:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Header - Standardized with PropertyBrowseTabs */}
                    <div className="flex flex-col items-center text-center">
                        <h1 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
                            {t("Properties.propertyListing")}
                            <span className="font-normal text-neutral-700">{listingSubtitle}</span>
                        </h1>
                        <p className="mt-2 max-w-xl text-base text-neutral-600">
                            Showing {properties.length} of {totalCount} available properties.
                        </p>
                    </div>

                    {/* Reusable Search & Filter Component */}
                    <div className="mt-8">
                        <PropertySearchFilter
                            initialState={params.state}
                            initialDistrict={params.district}
                            initialPropertyType={resolvedPropertyType}
                            initialSort={params.sort}
                        />
                    </div>

                    {/* Results Grid */}
                    {properties.length === 0 ? (
                        <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                            <p className="text-lg font-semibold text-neutral-700">
                                No properties found matching your selection.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {properties.map((property) => (
                                    <PropertyCard key={property.id} property={property} searchString={searchString} />
                                ))}
                            </div>

                            {/* Standardized Pagination Controls */}
                            <PropertiesPagePagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalCount}
                                pageSize={pageSize}
                            />
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
