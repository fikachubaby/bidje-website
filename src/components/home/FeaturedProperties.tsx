import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PropertyCard } from "@/components/properties/PropertyCard";
import type { Property } from "@/types/property";

interface FeaturedPropertiesProps {
  properties: Property[];
}

export function FeaturedProperties({ properties }: FeaturedPropertiesProps) {
  return (
    <section className="bg-neutral-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand">
              Handpicked for you
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Featured Properties
            </h2>
            <p className="mt-3 max-w-lg text-neutral-600">
              Premium listings selected by our team — exceptional value and
              prime locations.
            </p>
          </div>
          <Link
            href="/properties?featured=true"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
          >
            View all featured
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
