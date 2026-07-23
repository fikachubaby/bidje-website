import Link from "next/link";
import {
  Building2,
  Gavel,
  Home,
  Map,
  Store,
} from "lucide-react";
import type { PropertyCategory } from "@/types/property";

const categories: {
  id: PropertyCategory;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "land",
    label: "Land",
    description: "Plots & development land",
    icon: Map,
  },
  {
    id: "landed",
    label: "Landed",
    description: "Terrace, semi-D & bungalows",
    icon: Home,
  },
  {
    id: "high-rise",
    label: "High Rise",
    description: "Condos & serviced apartments",
    icon: Building2,
  },
  {
    id: "commercial",
    label: "Commercial",
    description: "Offices, retail & industrial",
    icon: Store,
  },
  {
    id: "auction",
    label: "Auction",
    description: "Below-market deals",
    icon: Gavel,
  },
];

export function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
          Browse by Category
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-neutral-600">
          Whether you&apos;re investing in land or finding your dream home, we
          have the right category for you.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={`/properties?category=${cat.id}`}
              className="group flex flex-col items-center rounded-2xl border-2 border-black bg-white p-6 text-center shadow-[4px_4px_0_0_#000] transition-all hover:-translate-y-0.5 hover:bg-brand-muted"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-black bg-brand-muted text-black transition-colors group-hover:bg-brand">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-neutral-900">
                {cat.label}
              </h3>
              <p className="mt-1 text-sm text-neutral-500">
                {cat.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
