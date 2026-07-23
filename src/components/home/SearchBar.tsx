"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { PropertyCategory } from "@/types/property";
import { cn } from "@/lib/utils";

const locations = [
  { value: "", label: "Entire Malaysia" },
  { value: "Kuala Lumpur", label: "Kuala Lumpur" },
  { value: "Selangor", label: "Selangor" },
  { value: "Penang", label: "Penang" },
  { value: "Johor", label: "Johor" },
  { value: "Cyberjaya", label: "Cyberjaya" },
  { value: "Damansara", label: "Damansara" },
];

const propertyTypes: { value: PropertyCategory | ""; label: string }[] = [
  { value: "", label: "Any property" },
  { value: "land", label: "Land" },
  { value: "landed", label: "Landed" },
  { value: "high-rise", label: "High Rise" },
  { value: "commercial", label: "Commercial" },
  { value: "auction", label: "Auction" },
];

const priceRanges = [
  { value: "", label: "Any price", min: "", max: "" },
  { value: "0-500000", label: "Up to RM 500K", min: "0", max: "500000" },
  { value: "500000-1000000", label: "RM 500K – 1M", min: "500000", max: "1000000" },
  { value: "1000000-3000000", label: "RM 1M – 3M", min: "1000000", max: "3000000" },
  { value: "3000000-", label: "Above RM 3M", min: "3000000", max: "" },
];

interface SearchFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

function SearchField({
  id,
  label,
  value,
  onChange,
  options,
  className,
}: SearchFieldProps) {
  const selectedLabel =
    options.find((option) => option.value === value)?.label ?? options[0]?.label;

  return (
    <div className={cn("relative min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-5", className)}>
      <label
        htmlFor={id}
        className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-neutral-500"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer appearance-none bg-transparent pr-8 text-base font-semibold text-black focus:outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-black"
          aria-hidden="true"
        />
        <span className="sr-only">{selectedLabel}</span>
      </div>
    </div>
  );
}

export function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState<PropertyCategory | "">("");
  const [priceRange, setPriceRange] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (category) params.set("category", category);

    const selectedRange = priceRanges.find((range) => range.value === priceRange);
    if (selectedRange?.min) params.set("minPrice", selectedRange.min);
    if (selectedRange?.max) params.set("maxPrice", selectedRange.max);

    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="relative z-20 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSearch}
        className="rounded-[2rem] border-[3px] border-black bg-white shadow-[6px_6px_0_0_#000]"
      >
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          <div className="flex flex-1 flex-col divide-y divide-neutral-200 sm:flex-row sm:divide-x sm:divide-y-0">
            <SearchField
              id="location"
              label="Location"
              value={location}
              onChange={setLocation}
              options={locations}
            />
            <SearchField
              id="property-type"
              label="Property Type"
              value={category}
              onChange={(value) => setCategory(value as PropertyCategory | "")}
              options={propertyTypes}
            />
            <SearchField
              id="price-range"
              label="Price Range"
              value={priceRange}
              onChange={setPriceRange}
              options={priceRanges.map(({ value, label }) => ({ value, label }))}
            />
          </div>

          <div className="border-t border-neutral-200 p-3 lg:border-l lg:border-t-0 lg:p-4">
            <button
              type="submit"
              className="flex h-full min-h-14 w-full items-center justify-center gap-2 rounded-[1.25rem] border-[3px] border-black bg-brand px-8 py-4 text-base font-bold text-black transition-colors hover:bg-brand-dark lg:min-w-[10rem]"
            >
              Search
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
