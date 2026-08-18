"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, House, MapPin, Search, X } from "lucide-react";
import { PROPERTY_TYPES } from "@/types/property";
import { MALAYSIAN_STATES, STATE_DISTRICTS } from "@/constants/locations";

interface PropertySearchFilterProps {
    initialState?: string;
    initialDistrict?: string;
    initialPropertyType?: string;
    initialSort?: string;
}

export function PropertySearchFilter({
    initialState = "",
    initialDistrict = "",
    initialPropertyType = "",
    initialSort = "newest",
}: PropertySearchFilterProps) {
    const [state, setState] = useState(initialState);
    const [district, setDistrict] = useState(initialDistrict);
    const [propertyType, setPropertyType] = useState(initialPropertyType);
    const [sort, setSort] = useState(initialSort);

    useEffect(() => {
        setState(initialState || "");
        setDistrict(initialDistrict || "");
        setPropertyType(initialPropertyType || "");
        setSort(initialSort || "newest");
    }, [initialState, initialDistrict, initialPropertyType, initialSort]);

    const districts = useMemo(() => {
        if (!state || !(state in STATE_DISTRICTS)) return [];
        return STATE_DISTRICTS[state];
    }, [state]);

    const handleStateChange = (value: string) => {
        setState(value);
        setDistrict("");
    };

    const handleClear = () => {
        setState("");
        setDistrict("");
        setPropertyType("");
        setSort("newest");
    };

    return (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-4 shadow-sm sm:p-6">
            <form method="GET" action="/properties" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* State Selection */}
                <div className="relative rounded-xl border border-neutral-200 bg-white p-3">
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-neutral-500">
                        <MapPin className="h-3.5 w-3.5 text-neutral-400" /> State
                    </label>
                    <div className="relative">
                        <select
                            name="state"
                            value={state}
                            onChange={(e) => handleStateChange(e.target.value)}
                            className="w-full appearance-none bg-transparent pr-8 text-sm font-bold text-black outline-none cursor-pointer"
                        >
                            <option value="">Entire Malaysia</option>
                            {MALAYSIAN_STATES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    </div>
                </div>

                {/* District Selection */}
                <div className="relative rounded-xl border border-neutral-200 bg-white p-3">
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-neutral-500">
                        <MapPin className="h-3.5 w-3.5 text-neutral-400" /> District / Area
                    </label>
                    <div className="relative">
                        <select
                            name="district"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            disabled={!state}
                            className="w-full appearance-none bg-transparent pr-8 text-sm font-bold text-black outline-none cursor-pointer disabled:text-neutral-400"
                        >
                            <option value="">{state ? `All ${state}` : "Select state first"}</option>
                            {districts.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    </div>
                </div>

                {/* Property Type Selection */}
                <div className="relative rounded-xl border border-neutral-200 bg-white p-3">
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-neutral-500">
                        <House className="h-3.5 w-3.5 text-neutral-400" /> Property Type
                    </label>
                    <div className="relative">
                        <select
                            name="property_type"
                            value={propertyType}
                            onChange={(e) => setPropertyType(e.target.value)}
                            className="w-full appearance-none bg-transparent pr-8 text-sm font-bold text-black outline-none cursor-pointer"
                        >
                            <option value="">All Property Types</option>
                            {PROPERTY_TYPES.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    </div>
                </div>

                {/* Sorting & Actions */}
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 rounded-xl border border-neutral-200 bg-white p-3">
                        <label className="mb-1 block text-xs font-bold uppercase text-neutral-500">Sort By</label>
                        <div className="relative">
                            <select
                                name="sort"
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="w-full appearance-none bg-transparent pr-6 text-sm font-bold text-black outline-none cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price_asc">Price: Low to High</option>
                                <option value="price_desc">Price: High to Low</option>
                                <option value="score_desc">Highest Investment Score</option>
                            </select>
                            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <button
                            type="submit"
                            className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-black px-4 text-sm font-black text-white transition hover:bg-neutral-800"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                        {(state || district || propertyType || sort !== "newest") && (
                            <Link
                                href="/properties"
                                onClick={handleClear}
                                className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100"
                            >
                                <X className="h-3 w-3" />
                            </Link>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}