import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/properties/PropertyCard";
import type { Property } from "@/types/property";

interface LatestListingsProps {
  properties: Property[];
}

export function LatestListings({ properties }: LatestListingsProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">
            Fresh on the market
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Latest Listings
          </h2>
          <p className="mt-3 max-w-lg text-neutral-600">
            Newly added properties updated daily. Don&apos;t miss out on the
            newest opportunities.
          </p>
        </div>
        <Link
          href="/properties"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          View all listings
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}
