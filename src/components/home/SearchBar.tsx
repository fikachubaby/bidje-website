"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { PropertyCategory } from "@/types/property";

const categories: { value: PropertyCategory | ""; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "land", label: "Land" },
  { value: "landed", label: "Landed" },
  { value: "high-rise", label: "High Rise" },
  { value: "commercial", label: "Commercial" },
  { value: "auction", label: "Auction" },
];

export function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<PropertyCategory | "">("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <section className="relative z-10 -mt-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl shadow-neutral-900/5 sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label
              htmlFor="location"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              placeholder="City, area, or postcode"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as PropertyCategory | "")
              }
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="minPrice"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500"
            >
              Min Price (MYR)
            </label>
            <input
              id="minPrice"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label
              htmlFor="maxPrice"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-500"
            >
              Max Price (MYR)
            </label>
            <input
              id="maxPrice"
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark sm:mt-6"
        >
          <Search className="h-4 w-4" />
          Search Properties
        </button>
      </form>
    </section>
  );
}
