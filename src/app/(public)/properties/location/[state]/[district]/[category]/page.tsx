import Link from "next/link";
import Image from 'next/image';
import type { Metadata } from "next";
import { MapPin, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { getFilteredProperties } from "@/lib/properties/properties";

interface DistrictCategoryPageProps {
    params: Promise<{ state: string; district: string; category: string }>;
}

export async function generateMetadata({ params }: DistrictCategoryPageProps): Promise<Metadata> {
    const { state, district, category } = await params;
    const formattedCategory = category.replace(/-/g, " ");
    const formattedDistrict = district.replace(/-/g, " ");
    const formattedState = state.replace(/-/g, " ");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bidje.com";

    return {
        title: `${formattedCategory} Properties for Sale in ${formattedDistrict}, ${formattedState} | Bidje`,
        description: `Explore verified ${formattedCategory} properties for sale in ${formattedDistrict}, ${formattedState}. Compare prices, inspect valuations, and submit direct offers on Bidje.`,
        alternates: {
            canonical: `${siteUrl}/properties/location/${state}/${district}/${category}`,
        },
        openGraph: {
            title: `${formattedCategory} Properties in ${formattedDistrict}, ${formattedState}`,
            description: `Browse active ${formattedCategory} property listings in ${formattedDistrict}, ${formattedState}. Submit verified offers directly on Bidje.`,
        },
    };
}

export default async function DistrictCategoryPropertiesPage({ params }: DistrictCategoryPageProps) {
    const { state, district, category } = await params;
    const formattedCategory = category.replace(/-/g, " ");
    const formattedDistrict = district.replace(/-/g, " ");
    const formattedState = state.replace(/-/g, " ");

    const properties = await getFilteredProperties({ state, district, category });

    return (
        <main className="min-h-screen bg-neutral-50 text-black">
            <Navbar />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="rounded-2xl border-2 border-black bg-[#ffd400] p-6 shadow-[4px_4px_0_0_#000] sm:p-8">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/70">
                        <MapPin className="h-4 w-4" /> {formattedDistrict}, {formattedState}
                    </div>
                    <h1 className="mt-2 text-3xl font-black capitalize sm:text-4xl">
                        {formattedCategory} Properties in {formattedDistrict}
                    </h1>
                    <p className="mt-2 text-sm font-semibold text-neutral-800">
                        Showing {properties.length} verified {properties.length === 1 ? "listing" : "listings"} in {formattedDistrict}, {formattedState}.
                    </p>
                </div>

                {/* Listings Grid */}
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {properties.length > 0 ? (
                        properties.map((property) => (
                            <div
                                key={property.id}
                                className="flex flex-col justify-between rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]"
                            >
                                <div>
                                    {property.imageUrl && (
                                        <div className="mb-4 aspect-video overflow-hidden rounded-xl border-2 border-black relative">
                                            <Image
                                                src={property.imageUrl}
                                                alt={property.title || 'Property image'}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between gap-2 text-xs font-bold text-neutral-500">
                                        <span className="rounded-md bg-neutral-100 px-2 py-1 uppercase text-neutral-700">
                                            {property.category}
                                        </span>
                                        {property.tenure && <span>{property.tenure}</span>}
                                    </div>
                                    <h2 className="mt-2 text-lg font-bold line-clamp-2">{property.title}</h2>
                                    <p className="mt-1 text-xs text-neutral-600 line-clamp-1">{property.location}</p>
                                </div>

                                <div className="mt-4 border-t border-neutral-200 pt-4">
                                    <p className="text-2xl font-black">
                                        {property.currency} {property.price.toLocaleString()}
                                    </p>
                                    <Link
                                        href={`/properties/${property.id}`}
                                        className="mt-3 block w-full rounded-xl border-2 border-black bg-[#ffd400] py-2 text-center text-xs font-black shadow-[2px_2px_0_0_#000] hover:bg-yellow-400"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full rounded-2xl border-2 border-dashed border-neutral-300 bg-white p-12 text-center text-neutral-500">
                            No active {formattedCategory} properties listed in {formattedDistrict} right now. Check back soon!
                        </div>
                    )}
                </div>

                {/* Navigation Link */}
                <div className="mt-8">
                    <Link
                        href={`/properties/location/${state}/${district}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-neutral-700 hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" /> View all property types in {formattedDistrict}
                    </Link>
                </div>
            </div>
        </main>
    );
}