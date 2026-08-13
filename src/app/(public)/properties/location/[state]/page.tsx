import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { MapPin } from "lucide-react";
import { getFilteredProperties } from "@/lib/properties/property-service";
import { PropertyListingGrid } from "@/components/property/PropertyListingGrid";
import { getStateName, VALID_CATEGORIES } from "@/config/locations";

interface StatePageProps {
    params: Promise<{ state: string }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
    const { state } = await params;
    const stateName = getStateName(state);

    if (!stateName) {
        return { title: "Properties | Bidje" };
    }

    return {
        title: `Properties for Sale in ${stateName} | Houses, Land & Commercial | Bidje`,
        description: `Find properties for sale in ${stateName}. Browse residential houses, land, and commercial properties in ${stateName} with market valuations and direct offer tools.`,
        alternates: {
            canonical: `https://www.bidje.com/properties/location/${state.toLowerCase()}`,
        },
        openGraph: {
            title: `Properties for Sale in ${stateName} | Bidje`,
            description: `Explore top properties for sale across ${stateName}. Submit direct offers online with Bidje.`,
        },
    };
}

export default async function StatePropertiesPage({ params, searchParams }: StatePageProps) {
    const { state } = await params;
    const { page } = await searchParams;
    const stateName = getStateName(state);

    if (!stateName) {
        notFound();
    }

    const currentPage = page ? parseInt(page, 10) : 1;

    const { properties, totalCount, totalPages } = await getFilteredProperties({
        state,
        page: currentPage,
        limit: 9,
    });

    return (
        <main className="min-h-screen bg-neutral-50 text-black">
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-2xl border-2 border-black bg-[#ffd400] p-8 shadow-[4px_4px_0_0_#000]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/70">
                        <MapPin className="h-4 w-4" /> State Region
                    </div>
                    <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                        Properties for Sale in {stateName}
                    </h1>
                    <p className="mt-2 text-sm font-semibold text-neutral-800">
                        Explore residential, landed, commercial, and land listings in {stateName}.
                    </p>
                </div>

                {/* Category quick links — the internal linking that actually drives pSEO */}
                <div className="mt-6 flex flex-wrap gap-2">
                    {Object.entries(VALID_CATEGORIES).map(([slug, label]) => (
                        <Link
                            key={slug}
                            href={`/properties/location/${state}/category/${slug}`}
                            className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm font-semibold hover:bg-neutral-100"
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <Link href="/properties" className="text-sm font-bold text-neutral-600 hover:underline">
                        &larr; View all listings
                    </Link>
                </div>

                <PropertyListingGrid
                    properties={properties}
                    totalCount={totalCount}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    basePath={`/properties/location/${state}`}
                    emptyMessage={`No properties found in ${stateName} yet.`}
                />
            </div>
        </main>
    );
}