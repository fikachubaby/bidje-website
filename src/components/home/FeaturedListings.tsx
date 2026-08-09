import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getFeaturedProperties } from "@/lib/properties/property-service";
import { PropertyCard } from "@/components/property/PropertyCard";

export async function FeaturedListings() {
    const featuredProperties = await getFeaturedProperties(3);

    // Fallback: If no featured listings exist, return null to keep homepage layout clean
    if (!featuredProperties || featuredProperties.length === 0) {
        return null;
    }

    return (
        <section className="bg-neutral-50/60 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f0dda0] bg-[#fff9dc] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-black">
                            <Sparkles className="h-3.5 w-3.5 fill-[#ffd400] text-[#ffd400]" />
                            Handpicked Deals
                        </div>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
                            Featured Investment Properties
                        </h2>
                        <p className="mt-2 text-base text-neutral-600">
                            Verified high-value properties evaluated with Bidje scoring and direct offer support.
                        </p>
                    </div>

                    <Link
                        href="/properties?isFeatured=true"
                        className="group inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
                    >
                        View All Featured
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

                {/* Featured Grid */}
                <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredProperties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
            </div>
        </section>
    );
}