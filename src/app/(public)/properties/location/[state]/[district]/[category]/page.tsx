import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowLeft, Tag } from "lucide-react";
import { getFilteredProperties } from "@/lib/properties/property-service";
import { PropertyListingGrid } from "@/components/property/PropertyListingGrid";
import { getStateName, getDistrictName, getCategoryName } from "@/config/locations";

interface DistrictCategoryPageProps {
    params: Promise<{ state: string; district: string; category: string }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: DistrictCategoryPageProps): Promise<Metadata> {
    const { state, district, category } = await params;
    const stateName = getStateName(state);
    const districtName = getDistrictName(state, district);
    const categoryName = getCategoryName(category);

    if (!stateName || !districtName || !categoryName) {
        return { title: "Properties | Bidje" };
    }

    return {
        title: `${categoryName} Properties for Sale in ${districtName}, ${stateName} | Bidje`,
        description: `Browse ${categoryName.toLowerCase()} properties for sale in ${districtName}, ${stateName}. Compare prices, view market valuations, and submit direct offers with Bidje.`,
        alternates: {
            canonical: `https://www.bidje.com/properties/location/${state.toLowerCase()}/${district.toLowerCase()}/${category.toLowerCase()}`,
        },
        openGraph: {
            title: `${categoryName} Properties for Sale in ${districtName}, ${stateName} | Bidje`,
            description: `Explore ${categoryName.toLowerCase()} listings in ${districtName}, ${stateName}.`,
        },
    };
}

export default async function DistrictCategoryPropertiesPage({ params, searchParams }: DistrictCategoryPageProps) {
    const { state, district, category } = await params;
    const { page } = await searchParams;
    const stateName = getStateName(state);
    const districtName = getDistrictName(state, district);
    const categoryName = getCategoryName(category);

    if (!stateName || !districtName || !categoryName) {
        notFound();
    }

    const currentPage = page ? parseInt(page, 10) : 1;

    const { properties, totalCount, totalPages } = await getFilteredProperties({
        state,
        district,
        category,
        page: currentPage,
        limit: 9,
    });

    return (
        <main className="min-h-screen bg-neutral-50 text-black">
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-2xl border-2 border-black bg-[#ffd400] p-6 shadow-[4px_4px_0_0_#000] sm:p-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/70">
                        <Tag className="h-4 w-4" /> {districtName}, {stateName}
                    </div>
                    <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                        {categoryName} Properties in {districtName}
                    </h1>
                    <p className="mt-2 text-sm font-semibold text-neutral-800">
                        Browse {categoryName.toLowerCase()} listings in {districtName}, {stateName} with market valuations and direct offer tools.
                    </p>
                </div>

                <div className="mt-8">
                    <Link
                        href={`/properties/location/${state}/${district}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700 hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" /> View all property types in {districtName}
                    </Link>
                </div>

                <PropertyListingGrid
                    properties={properties}
                    totalCount={totalCount}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    basePath={`/properties/location/${state}/${district}/${category}`}
                    emptyMessage={`No ${categoryName.toLowerCase()} properties found in ${districtName} yet.`}
                />
            </div>
        </main>
    );
}