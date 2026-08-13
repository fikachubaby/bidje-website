import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { MapPin } from "lucide-react";
import { getFilteredProperties } from "@/lib/properties/property-service";
import { PropertyListingGrid } from "@/components/property/PropertyListingGrid";
import { getStateName, getDistrictName, VALID_CATEGORIES } from "@/config/locations";

interface DistrictPageProps {
    params: Promise<{ state: string; district: string }>;
    searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: DistrictPageProps): Promise<Metadata> {
    const { state, district } = await params;
    const stateName = getStateName(state);
    const districtName = getDistrictName(state, district);

    if (!stateName || !districtName) {
        return { title: "Properties | Bidje" };
    }

    return {
        title: `Properties for Sale in ${districtName}, ${stateName} | Bidje`,
        description: `Find properties for sale in ${districtName}, ${stateName}. Browse residential houses, land, and commercial properties with market valuations and direct offer tools.`,
        alternates: {
            canonical: `https://bidje.com/properties/location/${state.toLowerCase()}/${district.toLowerCase()}`,
        },
        openGraph: {
            title: `Properties for Sale in ${districtName}, ${stateName} | Bidje`,
            description: `Explore top properties for sale in ${districtName}, ${stateName}. Submit direct offers online with Bidje.`,
        },
    };
}

export default async function DistrictPropertiesPage({ params, searchParams }: DistrictPageProps) {
    const { state, district } = await params;
    const { page } = await searchParams;
    const stateName = getStateName(state);
    const districtName = getDistrictName(state, district);

    if (!stateName || !districtName) {
        notFound();
    }

    const currentPage = page ? parseInt(page, 10) : 1;

    const { properties, totalCount, totalPages } = await getFilteredProperties({
        state,
        district,
        page: currentPage,
        limit: 9,
    });

    return (
        <main className="min-h-screen bg-neutral-50 text-black">
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-2xl border-2 border-black bg-[#ffd400] p-8 shadow-[4px_4px_0_0_#000]">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/70">
                        <MapPin className="h-4 w-4" /> {districtName}, {stateName}
                    </div>
                    <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                        Properties for Sale in {districtName}, {stateName}
                    </h1>
                    <p className="mt-2 text-sm font-semibold text-neutral-800">
                        Explore residential, landed, commercial, and land listings in {districtName}.
                    </p>
                </div>

                {/* Category quick links */}
                <div className="mt-6 flex flex-wrap gap-2">
                    {Object.entries(VALID_CATEGORIES).map(([slug, label]) => (
                        <Link
                            key={slug}
                            href={`/properties/location/${state}/${district}/${slug}`}
                            className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm font-semibold hover:bg-neutral-100"
                        >
                            {label}
                        </Link>
                    ))}
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
                    basePath={`/properties/location/${state}/${district}`}
                    emptyMessage={`No properties found in ${districtName} yet.`}
                />
            </div>
        </main>
    );
}