import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Tag } from "lucide-react";
import { getFilteredProperties } from "@/lib/properties/property-service";
import { PropertyListingGrid } from "@/components/property/PropertyListingGrid";
import { getStateName, getCategoryName } from "@/config/locations";

interface StateCategoryPageProps {
    params: Promise<{ state: string; category: string }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: StateCategoryPageProps): Promise<Metadata> {
    const { state, category } = await params;
    const stateName = getStateName(state);
    const categoryName = getCategoryName(category);

    if (!stateName || !categoryName) {
        return { title: "Properties | Bidje" };
    }

    return {
        title: `${categoryName} Properties for Sale in ${stateName} | Bidje`,
        description: `Browse ${categoryName.toLowerCase()} properties for sale in ${stateName}. Compare prices, view market valuations, and submit direct offers with Bidje.`,
        alternates: {
            canonical: `https://www.bidje.com/properties/location/${state.toLowerCase()}/category/${category.toLowerCase()}`,
        },
        openGraph: {
            title: `${categoryName} Properties for Sale in ${stateName} | Bidje`,
            description: `Explore ${categoryName.toLowerCase()} listings across ${stateName}.`,
        },
    };
}

export default async function StateCategoryPropertiesPage({ params, searchParams }: StateCategoryPageProps) {
    const { state, category } = await params;
    const { page } = await searchParams;
    const stateName = getStateName(state);
    const categoryName = getCategoryName(category);

    if (!stateName || !categoryName) {
        notFound();
    }

    const currentPage = page ? parseInt(page, 10) : 1;

    const { properties, totalCount, totalPages } = await getFilteredProperties({
        state,
        category,
        page: currentPage,
        limit: 9,
    });

    return (
        <main className="min-h-screen bg-neutral-50 text-black">
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-2xl border-2 border-black bg-[#ffd400] p-8 shadow-[4px_4px_0_0_#000]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/70">
                        <Tag className="h-4 w-4" /> {categoryName}
                    </div>
                    <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                        {categoryName} Properties for Sale in {stateName}
                    </h1>
                    <p className="mt-2 text-sm font-semibold text-neutral-800">
                        Browse {categoryName.toLowerCase()} listings across {stateName} with market valuations and direct offer tools.
                    </p>
                </div>

                <div className="mt-8 flex items-center gap-4">
                    <Link href={`/properties/location/${state}`} className="text-sm font-bold text-neutral-600 hover:underline">
                        &larr; All properties in {stateName}
                    </Link>
                </div>

                <PropertyListingGrid
                    properties={properties}
                    totalCount={totalCount}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    basePath={`/properties/location/${state}/category/${category}`}
                    emptyMessage={`No ${categoryName.toLowerCase()} properties found in ${stateName} yet.`}
                />
            </div>
        </main>
    );
}