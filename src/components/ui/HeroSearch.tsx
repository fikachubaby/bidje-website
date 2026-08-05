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
} from "lucide-react";

const MALAYSIAN_STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Penang",
  "Perak",
  "Perlis",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "Kuala Lumpur",
  "Labuan",
  "Putrajaya",
];

const STATE_DISTRICTS: Record<string, string[]> = {
  Johor: [
    "Johor Bahru",
    "Batu Pahat",
    "Kluang",
    "Kulai",
    "Muar",
    "Segamat",
    "Pontian",
    "Kota Tinggi",
    "Mersing",
    "Tangkak",
  ],
  Kedah: [
    "Alor Setar",
    "Sungai Petani",
    "Kulim",
    "Langkawi",
    "Baling",
    "Bandar Baharu",
    "Kota Setar",
    "Kubang Pasu",
    "Kuala Muda",
    "Padang Terap",
    "Pendang",
    "Pokok Sena",
    "Sik",
    "Yan",
  ],
  Kelantan: [
    "Kota Bharu",
    "Pasir Mas",
    "Tumpat",
    "Bachok",
    "Pasir Puteh",
    "Machang",
    "Tanah Merah",
    "Jeli",
    "Kuala Krai",
    "Gua Musang",
  ],
  Melaka: ["Melaka Tengah", "Alor Gajah", "Jasin"],
  "Negeri Sembilan": [
    "Seremban",
    "Port Dickson",
    "Rembau",
    "Tampin",
    "Kuala Pilah",
    "Jelebu",
    "Jempol",
  ],
  Pahang: [
    "Kuantan",
    "Temerloh",
    "Bentong",
    "Raub",
    "Cameron Highlands",
    "Lipis",
    "Jerantut",
    "Maran",
    "Bera",
    "Rompin",
    "Pekan",
  ],
  Penang: [
    "George Town",
    "Butterworth",
    "Bukit Mertajam",
    "Bayan Lepas",
    "Seberang Perai",
    "Barat Daya",
    "Timur Laut",
    "Seberang Perai Utara",
    "Seberang Perai Tengah",
    "Seberang Perai Selatan",
  ],
  Perak: [
    "Ipoh",
    "Taiping",
    "Teluk Intan",
    "Manjung",
    "Kuala Kangsar",
    "Larut Matang",
    "Hilir Perak",
    "Batu Gajah",
    "Kampar",
    "Kerian",
    "Kinta",
    "Perak Tengah",
    "Hulu Perak",
    "Bagan Datuk",
  ],
  Perlis: ["Kangar", "Arau", "Padang Besar"],
  Sabah: [
    "Kota Kinabalu",
    "Sandakan",
    "Tawau",
    "Lahad Datu",
    "Keningau",
    "Kudat",
    "Beaufort",
    "Papar",
    "Penampang",
    "Tuaran",
    "Ranau",
    "Semporna",
  ],
  Sarawak: [
    "Kuching",
    "Miri",
    "Sibu",
    "Bintulu",
    "Sarikei",
    "Sri Aman",
    "Betong",
    "Mukah",
    "Kapit",
    "Limbang",
    "Samarahan",
    "Serian",
  ],
  Selangor: [
    "Gombak",
    "Hulu Langat",
    "Hulu Selangor",
    "Klang",
    "Kuala Langat",
    "Kuala Selangor",
    "Petaling",
    "Sabak Bernam",
    "Sepang",
  ],
  Terengganu: [
    "Kuala Terengganu",
    "Kemaman",
    "Dungun",
    "Marang",
    "Hulu Terengganu",
    "Besut",
    "Setiu",
  ],
  "Kuala Lumpur": [
    "Wangsa Maju",
    "Setiawangsa",
    "Cheras",
    "Kepong",
    "Segambut",
    "Setapak",
    "Bukit Bintang",
    "Titiwangsa",
    "Bangsar",
    "Mont Kiara",
    "Bukit Jalil",
    "Lembah Pantai",
    "Bandar Tun Razak",
    "Seputeh",
    "Sentul",
    "Brickfields",
    "Damansara",
    "Ampang",
    "Sri Petaling",
    "OUG",
  ],
  Labuan: ["Victoria", "Bukit Kuda", "Layang-Layangan", "Rancha-Rancha"],
  Putrajaya: [
    "Presint 1",
    "Presint 2",
    "Presint 3",
    "Presint 4",
    "Presint 5",
    "Presint 6",
    "Presint 7",
    "Presint 8",
    "Presint 9",
    "Presint 10",
    "Presint 11",
    "Presint 12",
    "Presint 13",
    "Presint 14",
    "Presint 15",
    "Presint 16",
    "Presint 17",
    "Presint 18",
    "Presint 19",
    "Presint 20",
  ],
};

function formatPrice(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parsePrice(value: string) {
  return value.replace(/\D/g, "");
}

const selectClassName =
  "h-16 w-full min-w-0 cursor-pointer appearance-none rounded-2xl border-2 border-[#FFD400] bg-neutral-50 px-4 pr-11 text-base font-black outline-none transition focus:border-black focus:ring-2 focus:ring-[#ffd400] disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400";

const fieldShellClassName = "relative min-w-0 rounded-2xl bg-white px-5 py-5";
const fieldDividerClassName =
  "relative min-w-0 rounded-2xl border-t border-neutral-200 bg-white px-5 py-5 md:border-l md:border-t-0";

const priceInputClassName =
  "h-16 w-full min-w-0 rounded-2xl border-2 border-[#FFD400] bg-neutral-50 pl-14 pr-3 text-[17px] font-extrabold tracking-tight outline-none transition placeholder:font-bold placeholder:text-neutral-400 focus:border-[#FFD400] focus:ring-2 focus:ring-[#ffd400]";

export default function HeroSearch() {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [minPriceDisplay, setMinPriceDisplay] = useState("");
  const [maxPriceDisplay, setMaxPriceDisplay] = useState("");

  const districts = useMemo(() => {
    if (!state || !(state in STATE_DISTRICTS)) return [];
    return STATE_DISTRICTS[state];
  }, [state]);

  const handleStateChange = (value: string) => {
    setState(value);
    setDistrict("");
  };

  const handlePriceChange = (
    rawValue: string,
    setter: (value: string) => void
  ) => {
    setter(formatPrice(rawValue));
  };

  return (
    <section className="relative bg-black text-white">
      <div className="relative min-h-[670px]">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=90"
          alt="Modern luxury property"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/25" />

        <div className="relative mx-auto flex min-h-[670px] max-w-7xl items-center px-6 pb-48 pt-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-black uppercase tracking-[0.25em] text-[#ffd400]">
              Malaysia Property Marketplace
            </p>

            <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              A happier way
              <br />
              to find your next
              <br />
              property<span className="text-[#ffd400]">.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-white/80">
              Browse verified opportunities and submit structured offers
              through a professional process managed by Bidje.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/50 px-4 py-3 text-sm font-bold backdrop-blur">
                <ShieldCheck className="h-5 w-5 text-[#ffd400]" />
                Verified Listings
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/50 px-4 py-3 text-sm font-bold backdrop-blur">
                <BadgeCheck className="h-5 w-5 text-[#ffd400]" />
                Structured Offers
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/50 px-4 py-3 text-sm font-bold backdrop-blur">
                <FileCheck2 className="h-5 w-5 text-[#ffd400]" />
                Professional Service
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 -bottom-[78px] z-30">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <form
              action="/properties"
              className="rounded-[26px] border border-neutral-200 bg-white p-5 text-black shadow-[0_28px_80px_rgba(0,0,0,0.4)]"
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,2fr)_190px]">
                <div className={fieldShellClassName}>
                  <div className="mb-3 flex h-7 items-center gap-3">
                    <MapPin className="h-6 w-6 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wide text-neutral-500">
                      State
                    </span>
                  </div>

                  <div className="relative min-w-0">
                    <select
                      name="state"
                      value={state}
                      onChange={(event) => handleStateChange(event.target.value)}
                      aria-label="Select state"
                      className={selectClassName}
                    >
                      <option value="">Entire Malaysia</option>
                      {MALAYSIAN_STATES.map((stateName) => (
                        <option key={stateName} value={stateName}>
                          {stateName}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                  </div>
                </div>

                <div className={fieldDividerClassName}>
                  <div className="mb-3 flex h-7 items-center gap-3">
                    <MapPin className="h-6 w-6 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wide text-neutral-500">
                      District / Area
                    </span>
                  </div>

                  <div className="relative min-w-0">
                    <select
                      name="district"
                      value={district}
                      onChange={(event) => setDistrict(event.target.value)}
                      disabled={!state}
                      aria-label="Select district or area"
                      className={selectClassName}
                    >
                      <option value="">
                        {state ? `All ${state}` : "Select a state first"}
                      </option>
                      {districts.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                  </div>
                </div>

                <div className={fieldDividerClassName}>
                  <div className="mb-3 flex h-7 items-center gap-3">
                    <House className="h-6 w-6 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wide text-neutral-500">
                      Property Type
                    </span>
                  </div>

                  <div className="relative min-w-0">
                    <select
                      name="category"
                      defaultValue=""
                      aria-label="Select property type"
                      className={selectClassName}
                    >
                      <option value="">All Property Types</option>
                      <option value="landed">Landed</option>
                      <option value="high-rise">High Rise</option>
                      <option value="land">Land</option>
                      <option value="commercial">Commercial</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                  </div>
                </div>

                <div className={fieldDividerClassName}>
                  <div className="mb-3 flex h-7 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-black text-[10px] font-black">
                      RM
                    </span>
                    <span className="text-xs font-black uppercase tracking-wide text-neutral-500">
                      Price Range
                    </span>
                  </div>

                  <div className="grid min-w-0 grid-cols-2 gap-3">
                    <div className="relative min-w-0">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-extrabold text-neutral-500">
                        RM
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={minPriceDisplay}
                        onChange={(event) =>
                          handlePriceChange(
                            event.target.value,
                            setMinPriceDisplay
                          )
                        }
                        placeholder="Min. Price"
                        aria-label="Minimum price"
                        className={priceInputClassName}
                      />
                      <input
                        type="hidden"
                        name="minPrice"
                        value={parsePrice(minPriceDisplay)}
                      />
                    </div>

                    <div className="relative min-w-0">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-extrabold text-neutral-500">
                        RM
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        value={maxPriceDisplay}
                        onChange={(event) =>
                          handlePriceChange(
                            event.target.value,
                            setMaxPriceDisplay
                          )
                        }
                        placeholder="Max. Price"
                        aria-label="Maximum price"
                        className={priceInputClassName}
                      />
                      <input
                        type="hidden"
                        name="maxPrice"
                        value={parsePrice(maxPriceDisplay)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex min-w-0 items-stretch p-2 md:col-span-2 xl:col-span-1">
                  <button
                    type="submit"
                    className="group flex min-h-[76px] w-full min-w-[180px] self-stretch items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#FFD400] via-[#FFE24D] to-[#FFC107] px-6 text-base font-black text-black shadow-[0_12px_40px_rgba(255,212,0,0.45),0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_20px_56px_rgba(255,212,0,0.55),0_12px_36px_rgba(0,0,0,0.18)] active:scale-95 xl:min-h-[112px]"
                  >
                    <Search className="relative h-5 w-5 shrink-0" />
                    <span className="relative">Search</span>
                    <ChevronRight className="relative h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
