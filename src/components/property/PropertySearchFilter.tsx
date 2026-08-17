"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, House, MapPin, Search, X } from "lucide-react";

const MALAYSIAN_STATES = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang",
    "Pulau Pinang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor",
    "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya",
];

const STATE_DISTRICTS: Record<string, string[]> = {
    Johor: ["Johor Bahru", "Batu Pahat", "Kluang", "Kulai", "Muar", "Segamat", "Pontian", "Kota Tinggi", "Mersing", "Tangkak"],
    Kedah: ["Alor Setar", "Sungai Petani", "Kulim", "Langkawi", "Baling", "Bandar Baharu", "Kota Setar", "Kubang Pasu", "Kuala Muda", "Padang Terap", "Pendang", "Pokok Sena", "Sik", "Yan"],
    Kelantan: ["Kota Bharu", "Pasir Mas", "Tumpat", "Bachok", "Pasir Puteh", "Machang", "Tanah Merah", "Jeli", "Kuala Krai", "Gua Musang"],
    Melaka: ["Melaka Tengah", "Alor Gajah", "Jasin"],
    "Negeri Sembilan": ["Seremban", "Port Dickson", "Rembau", "Tampin", "Kuala Pilah", "Jelebu", "Jempol"],
    Pahang: ["Kuantan", "Temerloh", "Bentong", "Raub", "Cameron Highlands", "Lipis", "Jerantut", "Maran", "Bera", "Rompin", "Pekan"],
    "Pulau Pinang": ["George Town", "Butterworth", "Bukit Mertajam", "Bayan Lepas", "Seberang Perai", "Barat Daya", "Timur Laut"],
    Perak: ["Ipoh", "Taiping", "Teluk Intan", "Manjung", "Kuala Kangsar", "Kampar", "Kerian", "Kinta", "Perak Tengah"],
    Perlis: ["Kangar", "Arau", "Padang Besar"],
    Sabah: ["Kota Kinabalu", "Sandakan", "Tawau", "Lahad Datu", "Keningau", "Kudat", "Beaufort", "Papar", "Penampang", "Tuaran", "Ranau", "Semporna"],
    Sarawak: ["Kuching", "Miri", "Sibu", "Bintulu", "Sarikei", "Sri Aman", "Betong", "Mukah", "Kapit", "Limbang", "Samarahan", "Serian"],
    Selangor: ["Gombak", "Hulu Langat", "Hulu Selangor", "Klang", "Kuala Langat", "Kuala Selangor", "Petaling", "Sabak Bernam", "Sepang"],
    Terengganu: ["Kuala Terengganu", "Kemaman", "Dungun", "Marang", "Hulu Terengganu", "Besut", "Setiu"],
    "Kuala Lumpur": ["Wangsa Maju", "Setiawangsa", "Cheras", "Kepong", "Segambut", "Setapak", "Bukit Bintang", "Titiwangsa", "Bangsar", "Mont Kiara", "Bukit Jalil", "Lembah Pantai", "Bandar Tun Razak", "Seputeh", "Sentul", "Brickfields", "Damansara", "Ampang", "Sri Petaling", "OUG"],
    Labuan: ["Victoria", "Bukit Kuda", "Layang-Layangan", "Rancha-Rancha"],
    Putrajaya: ["Presint 1", "Presint 2", "Presint 3", "Presint 4", "Presint 5", "Presint 6", "Presint 7", "Presint 8", "Presint 9", "Presint 10", "Presint 11", "Presint 12", "Presint 13", "Presint 14", "Presint 15", "Presint 16", "Presint 17", "Presint 18", "Presint 19", "Presint 20"],
};

interface PropertySearchFilterProps {
    initialState?: string;
    initialDistrict?: string;
    initialCategory?: string;
    initialSort?: string;
}

export function PropertySearchFilter({
    initialState = "",
    initialDistrict = "",
    initialCategory = "",
    initialSort = "newest",
}: PropertySearchFilterProps) {
    const [state, setState] = useState(initialState);
    const [district, setDistrict] = useState(initialDistrict);
    const [category, setCategory] = useState(initialCategory);
    const [sort, setSort] = useState(initialSort);

    // Sync internal state if URL properties change externally
    useEffect(() => {
        setState(initialState || "");
        setDistrict(initialDistrict || "");
        setCategory(initialCategory || "");
        setSort(initialSort || "newest");
    }, [initialState, initialDistrict, initialCategory, initialSort]);

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
        setCategory("");
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

                {/* Category Selection */}
                <div className="relative rounded-xl border border-neutral-200 bg-white p-3">
                    <label className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase text-neutral-500">
                        <House className="h-3.5 w-3.5 text-neutral-400" /> Category
                    </label>
                    <div className="relative">
                        <select
                            name="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full appearance-none bg-transparent pr-8 text-sm font-bold text-black outline-none cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="land">Land</option>
                            <option value="industrial">Industrial</option>
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
                        {(state || district || category || sort !== "newest") && (
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