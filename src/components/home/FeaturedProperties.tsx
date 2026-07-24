import Link from "next/link";
import { properties } from "./data";
import PropertyCard from "./PropertyCard";

export default function FeaturedProperties() {
  return (
    <section className="bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#9c7c00]">
          Selected opportunities
        </p>

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Featured Properties
          </h2>

          <Link
            href="/properties"
            className="font-black underline decoration-[#ffd400] decoration-4 underline-offset-4"
          >
            View all properties
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
