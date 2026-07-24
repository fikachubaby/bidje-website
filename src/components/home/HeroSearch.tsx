import Image from "next/image";
import {
  BadgeCheck,
  ChevronDown,
  FileCheck2,
  House,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";

export default function HeroSearch() {
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
              <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
                <div className="relative rounded-2xl bg-white px-5 py-5">
                  <div className="mb-2 flex items-center gap-3">
                    <MapPin className="h-6 w-6 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wide text-neutral-500">
                      Location
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      name="location"
                      defaultValue=""
                      aria-label="Select location"
                      className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 pr-11 text-base font-black outline-none transition focus:border-black focus:ring-2 focus:ring-[#ffd400]"
                    >
                      <option value="">Entire Malaysia</option>
                      <option value="Johor">Johor</option>
                      <option value="Kedah">Kedah</option>
                      <option value="Kelantan">Kelantan</option>
                      <option value="Melaka">Melaka</option>
                      <option value="Negeri Sembilan">Negeri Sembilan</option>
                      <option value="Pahang">Pahang</option>
                      <option value="Penang">Penang</option>
                      <option value="Perak">Perak</option>
                      <option value="Perlis">Perlis</option>
                      <option value="Sabah">Sabah</option>
                      <option value="Sarawak">Sarawak</option>
                      <option value="Selangor">Selangor</option>
                      <option value="Terengganu">Terengganu</option>
                      <option value="Kuala Lumpur">Kuala Lumpur</option>
                      <option value="Labuan">Labuan</option>
                      <option value="Putrajaya">Putrajaya</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                  </div>
                </div>

                <div className="relative rounded-2xl border-t border-neutral-200 bg-white px-5 py-5 lg:border-l lg:border-t-0">
                  <div className="mb-2 flex items-center gap-3">
                    <House className="h-6 w-6 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wide text-neutral-500">
                      Property Type
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      name="category"
                      defaultValue=""
                      aria-label="Select property type"
                      className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 pr-11 text-base font-black outline-none transition focus:border-black focus:ring-2 focus:ring-[#ffd400]"
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

                <div className="relative rounded-2xl border-t border-neutral-200 bg-white px-5 py-5 lg:border-l lg:border-t-0">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-black text-[10px] font-black">
                      RM
                    </span>
                    <span className="text-xs font-black uppercase tracking-wide text-neutral-500">
                      Price Range
                    </span>
                  </div>

                  <div className="relative">
                    <select
                      name="price"
                      defaultValue=""
                      aria-label="Select price range"
                      className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 pr-11 text-base font-black outline-none transition focus:border-black focus:ring-2 focus:ring-[#ffd400]"
                    >
                      <option value="">Any Price</option>
                      <option value="0-300000">Below RM300,000</option>
                      <option value="300000-500000">
                        RM300,000 – RM500,000
                      </option>
                      <option value="500000-1000000">
                        RM500,000 – RM1,000,000
                      </option>
                      <option value="1000000-">Above RM1,000,000</option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex items-stretch p-1">
                  <button
                    type="submit"
                    className="flex min-h-[118px] w-full items-center justify-center gap-3 rounded-2xl border-2 border-black bg-[#ffd400] px-9 text-base font-black shadow-[4px_4px_0_0_#000] transition hover:-translate-y-0.5 hover:bg-[#ffe24b] lg:w-auto"
                  >
                    <Search className="h-5 w-5" />
                    Find My Property
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
