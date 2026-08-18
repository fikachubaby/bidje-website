"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  House,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { PROPERTY_TYPES } from "@/types/property";
import { MALAYSIAN_STATES, STATE_DISTRICTS } from "@/constants/locations";

function formatPrice(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parsePrice(value: string) {
  return value.replace(/\D/g, "");
}

const selectClassName =
  "h-14 w-full min-w-0 cursor-pointer appearance-none rounded-2xl border-2 border-[#FFD400] bg-neutral-50 px-4 pr-11 text-sm font-black outline-none transition focus:border-black focus:ring-2 focus:ring-[#ffd400]";

const priceInputClassName =
  "h-14 w-full min-w-0 rounded-2xl border-2 border-[#FFD400] bg-neutral-50 pl-12 pr-3 text-sm font-extrabold tracking-tight outline-none transition placeholder:font-bold placeholder:text-neutral-400 focus:border-black focus:ring-2 focus:ring-[#ffd400]";

export default function HeroSearch() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [minPriceDisplay, setMinPriceDisplay] = useState("");
  const [maxPriceDisplay, setMaxPriceDisplay] = useState("");

  // Advanced filter states
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [tenure, setTenure] = useState("");
  const [bumiStatus, setBumiStatus] = useState("");
  const [sorting, setSorting] = useState("latest");

  const districts = useMemo(() => {
    if (!state || !(state in STATE_DISTRICTS)) return [];
    return STATE_DISTRICTS[state];
  }, [state]);

  const handleStateChange = (value: string) => {
    setState(value);
    setDistrict("");
  };

  const handlePriceChange = (rawValue: string, setter: (val: string) => void) => {
    setter(formatPrice(rawValue));
  };

  return (
    <section className="relative bg-black text-white">
      <div className="relative min-h-[700px]">
        {/* Optimized Background Image using Next/Image for compression and LCP performance */}
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=85"
          alt="Modern luxury property marketplace in Malaysia"
          fill
          priority
          quality={85}
          className="object-cover"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

        <div className="relative mx-auto flex min-h-[700px] max-w-7xl items-center px-6 pb-48 pt-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-[#ffd400]">
              Malaysias Premier Property Marketplace
            </p>

            <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Find exclusive &
              <br />
              off-market properties<span className="text-[#ffd400]">.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-white/80">
              Unlock verified direct-owner listings, submit structured offers with automated document verification, and manage your property journey securely.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/50 px-4 py-2.5 text-xs sm:text-sm font-bold backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-[#ffd400]" />
                Verified Owners
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/50 px-4 py-2.5 text-xs sm:text-sm font-bold backdrop-blur">
                <BadgeCheck className="h-4 w-4 text-[#ffd400]" />
                RM 2/Month Access
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/50 px-4 py-2.5 text-xs sm:text-sm font-bold backdrop-blur">
                <FileCheck2 className="h-4 w-4 text-[#ffd400]" />
                Structured OTP Process
              </div>
            </div>
          </div>
        </div>

        {/* Server-Side Search Form Box */}
        <div className="absolute inset-x-0 -bottom-[110px] sm:-bottom-[90px] z-30">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <form
              action="/properties"
              method="GET"
              className="rounded-[28px] border border-neutral-200 bg-white p-5 sm:p-6 text-black shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
            >
              {/* Primary Search Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.8fr)_180px]">

                {/* State Filter */}
                <div className="relative rounded-2xl bg-neutral-50/50 p-4 border border-neutral-200">
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-500">State</span>
                  </div>
                  <div className="relative">
                    <select
                      name="state"
                      value={state}
                      onChange={(e) => handleStateChange(e.target.value)}
                      aria-label="Select state"
                      className={selectClassName}
                    >
                      <option value="">Entire Malaysia</option>
                      {MALAYSIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                  </div>
                </div>

                {/* District Filter */}
                <div className="relative rounded-2xl bg-neutral-50/50 p-4 border border-neutral-200">
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-neutral-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-500">District / Area</span>
                  </div>
                  <div className="relative">
                    <select
                      name="district"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      disabled={!state}
                      aria-label="Select district"
                      className={selectClassName}
                    >
                      <option value="">{state ? `All ${state}` : "Select state first"}</option>
                      {districts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                  </div>
                </div>

                {/* Property Type Filter (Replaces Category) */}
                <div className="relative rounded-2xl bg-neutral-50/50 p-4 border border-neutral-200">
                  <div className="mb-2 flex items-center gap-2">
                    <House className="h-4 w-4 text-neutral-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-500">Property Type</span>
                  </div>
                  <div className="relative">
                    <select
                      name="property_type"
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      aria-label="Select property type"
                      className={selectClassName}
                    >
                      <option value="">All Property Types</option>
                      {PROPERTY_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
                  </div>
                </div>

                {/* Price Range */}
                <div className="relative rounded-2xl bg-neutral-50/50 p-4 border border-neutral-200">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-neutral-500 text-[9px] font-black">RM</span>
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-500">Price Range (MYR)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={minPriceDisplay}
                        onChange={(e) => handlePriceChange(e.target.value, setMinPriceDisplay)}
                        placeholder="Min Price"
                        aria-label="Minimum price"
                        className={priceInputClassName}
                      />
                      <input type="hidden" name="minPrice" value={parsePrice(minPriceDisplay)} />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={maxPriceDisplay}
                        onChange={(e) => handlePriceChange(e.target.value, setMaxPriceDisplay)}
                        placeholder="Max Price"
                        aria-label="Maximum price"
                        className={priceInputClassName}
                      />
                      <input type="hidden" name="maxPrice" value={parsePrice(maxPriceDisplay)} />
                    </div>
                  </div>
                </div>

                {/* Submit & Toggle Advanced Filters */}
                <div className="flex flex-col justify-end gap-2">
                  <button
                    type="submit"
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#FFD400] text-sm font-black text-black shadow-md transition hover:bg-[#ffcc00] hover:scale-[1.01] active:scale-95"
                  >
                    <Search className="h-4 w-4" />
                    <span>Search Properties</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-black py-1"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {showAdvanced ? "Hide Filters" : "Advanced Filters"}
                  </button>
                </div>
              </div>

              {/* Advanced Collapsible Filters Panel (Fully Server-Driven via hidden/named query inputs) */}
              {showAdvanced && (
                <div className="mt-6 border-t border-neutral-200 pt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 animate-fadeIn">

                  {/* Bedrooms */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Bedrooms</label>
                    <select
                      name="bedrooms"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs font-bold text-black outline-none focus:border-black"
                    >
                      <option value="">Any Beds</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>

                  {/* Bathrooms */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Bathrooms</label>
                    <select
                      name="bathrooms"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs font-bold text-black outline-none focus:border-black"
                    >
                      <option value="">Any Baths</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  {/* Tenure */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Tenure</label>
                    <select
                      name="tenure"
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs font-bold text-black outline-none focus:border-black"
                    >
                      <option value="">All Tenures</option>
                      <option value="Freehold">Freehold</option>
                      <option value="Leasehold">Leasehold</option>
                    </select>
                  </div>

                  {/* Bumi Status */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Bumi Status</label>
                    <select
                      name="bumi_status"
                      value={bumiStatus}
                      onChange={(e) => setBumiStatus(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs font-bold text-black outline-none focus:border-black"
                    >
                      <option value="">All Status</option>
                      <option value="Bumi">Bumi Lot</option>
                      <option value="Non Bumi">Non-Bumi Lot</option>
                    </select>
                  </div>

                  {/* Sorting */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Sort By</label>
                    <select
                      name="sort"
                      value={sorting}
                      onChange={(e) => setSorting(e.target.value)}
                      className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs font-bold text-black outline-none focus:border-black"
                    >
                      <option value="latest">Latest Listings</option>
                      <option value="price_asc">Lowest Price</option>
                      <option value="price_desc">Highest Price</option>
                      <option value="popular">Most Popular</option>
                      <option value="featured">Featured First</option>
                    </select>
                  </div>

                  {/* Checkbox Flags (Urgent Sale / Auction) */}
                  <div className="col-span-full flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-neutral-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="urgent_sale"
                        value="true"
                        className="rounded border-neutral-300 text-black focus:ring-black h-4 w-4"
                      />
                      Urgent Sale Only 🔥
                    </label>
                  </div>

                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </section>
  );
}