import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Bath,
  BedDouble,
  Building2,
  ChevronDown,
  FileCheck2,
  Heart,
  House,
  LandPlot,
  MapPin,
  Search,
  ShieldCheck,
  Store,
  Zap,
} from "lucide-react";

const categories = [
  {
    title: "Landed Properties",
    description: "Terrace, semi-detached and bungalow",
    icon: House,
    href: "/properties?category=landed",
  },
  {
    title: "High Rise Properties",
    description: "Apartment, condominium and serviced residence",
    icon: Building2,
    href: "/properties?category=high-rise",
  },
  {
    title: "Land for Sale",
    description: "Residential, agricultural and development land",
    icon: LandPlot,
    href: "/properties?category=land",
  },
  {
    title: "Commercial Properties",
    description: "Shop lots, offices and industrial properties",
    icon: Store,
    href: "/properties?category=commercial",
  },
];

const properties = [
  {
    id: "1",
    badge: "Urgent Sale",
    title: "2 Storey Terrace",
    location: "Bandar Puteri, Puchong",
    price: "RM 680,000",
    bedrooms: "4",
    bathrooms: "3",
    size: "1,650 sqft",
    offers: "3 offers received",
    score: "85/100",
    rating: "Good Buy",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&q=85",
  },
  {
    id: "2",
    badge: "Below Market",
    title: "Condo with Facilities",
    location: "Setapak, Kuala Lumpur",
    price: "RM 450,000",
    bedrooms: "3",
    bathrooms: "2",
    size: "900 sqft",
    offers: "5 offers received",
    score: "78/100",
    rating: "Good Buy",
    image:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&q=85",
  },
  {
    id: "3",
    badge: "Motivated Seller",
    title: "Agricultural Land",
    location: "Kuala Langat, Selangor",
    price: "RM 780,000",
    bedrooms: "—",
    bathrooms: "—",
    size: "1.4 acres",
    offers: "2 offers received",
    score: "90/100",
    rating: "Excellent Buy",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&q=85",
  },
  {
    id: "4",
    badge: "Commercial",
    title: "Three Storey Shop Lot",
    location: "Kajang, Selangor",
    price: "RM 1,200,000",
    bedrooms: "—",
    bathrooms: "2",
    size: "2,200 sqft",
    offers: "2 offers received",
    score: "82/100",
    rating: "Good Buy",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&q=85",
  },
];

const benefits = [
  {
    title: "Verified Listings",
    description: "Every listing is checked before publication.",
    icon: ShieldCheck,
  },
  {
    title: "Professional Service",
    description: "Bidje manages the process from offer to closing.",
    icon: BadgeCheck,
  },
  {
    title: "Legal Support",
    description: "Assistance with documentation and legal processes.",
    icon: FileCheck2,
  },
  {
    title: "Fast Response",
    description: "A structured offer system reduces unnecessary enquiries.",
    icon: Zap,
  },
];

const steps = [
  {
    number: "1",
    title: "Submit an Offer",
    description: "Enter your offer and pay the RM500 commitment fee.",
  },
  {
    number: "2",
    title: "Bidje Reviews",
    description: "We verify and present the qualified offer.",
  },
  {
    number: "3",
    title: "Negotiate",
    description: "The offer may be accepted, rejected or countered.",
  },
  {
    number: "4",
    title: "Close the Deal",
    description: "Bidje manages the process after an agreement is reached.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-white text-black">
      <header className="sticky top-0 z-50 bg-black text-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl font-black tracking-tight text-[#ffd400]">
              BIDJE
            </span>
            <span className="hidden max-w-[130px] text-[10px] font-bold uppercase leading-tight text-white/80 sm:block">
              A happier way to find your next property
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-bold lg:flex">
            <Link href="/properties">Buy</Link>
            <Link href="/properties?category=subsale">Subsale</Link>
            <Link href="/properties?category=land">Land</Link>
            <Link href="/properties?category=landed">Landed</Link>
            <Link href="/properties?category=commercial">Commercial</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/saved"
              className="hidden items-center gap-2 text-sm font-bold sm:flex"
            >
              <Heart className="h-5 w-5" />
              Saved
            </Link>

            <Link href="/signin" className="hidden text-sm font-bold sm:block">
              Sign in
            </Link>

            <Link
              href="/list-property"
              className="rounded-xl border-2 border-[#ffd400] bg-[#ffd400] px-4 py-3 text-sm font-black text-black transition hover:bg-[#ffdf33]"
            >
              List Your Property
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-black text-white">
        <div className="relative min-h-[610px]">
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1800&q=90"
            alt="Luxury modern property at night"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

          <div className="relative mx-auto flex min-h-[610px] max-w-7xl items-center px-6 py-20 lg:px-8">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                A happier way
                <br />
                to find your next
                <br />
                property<span className="text-[#ffd400]">.</span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-white/85">
                Verified listings. Secure offers.
                <br />
                Professional service. Better outcomes.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-sm font-bold backdrop-blur">
                  <ShieldCheck className="h-5 w-5 text-[#ffd400]" />
                  Verified Listings
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/40 px-4 py-3 text-sm font-bold backdrop-blur">
                  <BadgeCheck className="h-5 w-5 text-[#ffd400]" />
                  Secure Offers
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-20 mx-auto -mt-24 max-w-7xl px-5 pb-10 sm:px-6 lg:px-8">
            <form
              action="/properties"
              className="rounded-2xl bg-white p-4 text-black shadow-2xl"
            >
              <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
                <label className="flex min-h-24 items-center gap-4 rounded-xl px-5">
                  <MapPin className="h-6 w-6" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase text-neutral-500">
                      Location
                    </span>
                    <select
                      name="location"
                      className="mt-1 w-full appearance-none bg-transparent text-base font-black outline-none"
                    >
                      <option value="">All States</option>
                      <option value="Johor">Johor</option>
                      <option value="Kedah">Kedah</option>
                      <option value="Kelantan">Kelantan</option>
                      <option value="Kuala Lumpur">Kuala Lumpur</option>
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
                    </select>
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </label>

                <label className="flex min-h-24 items-center gap-4 rounded-xl border-t border-neutral-200 px-5 lg:border-l lg:border-t-0">
                  <House className="h-6 w-6" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase text-neutral-500">
                      Property Type
                    </span>
                    <select
                      name="category"
                      className="mt-1 w-full appearance-none bg-transparent text-base font-black outline-none"
                    >
                      <option value="">All Types</option>
                      <option value="landed">Landed</option>
                      <option value="high-rise">High Rise</option>
                      <option value="land">Land</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </label>

                <label className="flex min-h-24 items-center gap-4 rounded-xl border-t border-neutral-200 px-5 lg:border-l lg:border-t-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black text-xs font-black">
                    RM
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold uppercase text-neutral-500">
                      Price Range
                    </span>
                    <select
                      name="price"
                      className="mt-1 w-full appearance-none bg-transparent text-base font-black outline-none"
                    >
                      <option value="">Any Price</option>
                      <option value="0-300000">Below RM300K</option>
                      <option value="300000-500000">RM300K – RM500K</option>
                      <option value="500000-1000000">RM500K – RM1M</option>
                      <option value="1000000-">Above RM1M</option>
                    </select>
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </label>

                <button
                  type="submit"
                  className="flex min-h-20 items-center justify-center gap-3 rounded-xl border-2 border-[#ffd400] bg-[#ffd400] px-8 text-base font-black transition hover:bg-[#ffdf33]"
                >
                  <Search className="h-5 w-5" />
                  Find My Property
                </button>
              </div>
            </form>
          </div>

          <div className="border-t border-white/10 bg-black">
            <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 text-white sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["2,458+", "Active Listings"],
                ["1,024+", "Offers Submitted"],
                ["89%", "Successful Deals"],
                ["100%", "Verified Listings"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="text-2xl font-black text-[#ffd400]">{value}</p>
                  <p className="mt-1 text-sm text-white/70">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#c59f00]">
              Find your property
            </p>
            <h2 className="mt-2 text-3xl font-black">Browse by Category</h2>
          </div>

          <Link
            href="/properties"
            className="hidden font-bold text-blue-600 hover:underline sm:block"
          >
            Browse all properties →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.title}
                href={category.href}
                className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-black hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#ffd400]">
                  <Icon className="h-7 w-7" />
                </div>

                <h3 className="mt-5 text-lg font-black">{category.title}</h3>

                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {category.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-neutral-50">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#c59f00]">
                Selected opportunities
              </p>
              <h2 className="mt-2 text-3xl font-black">
                Featured Properties
              </h2>
            </div>

            <Link
              href="/properties"
              className="hidden font-bold text-blue-600 hover:underline sm:block"
            >
              Browse all properties →
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {properties.map((property) => (
              <article
                key={property.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover transition duration-500 hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  />

                  <span className="absolute left-3 top-3 rounded-md bg-[#ffd400] px-3 py-1 text-xs font-black uppercase">
                    {property.badge}
                  </span>

                  <button
                    type="button"
                    aria-label={`Save ${property.title}`}
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-black">{property.title}</h3>

                  <p className="mt-1 flex items-center gap-1 text-sm text-neutral-600">
                    <MapPin className="h-4 w-4" />
                    {property.location}
                  </p>

                  <p className="mt-4 text-xl font-black">{property.price}</p>

                  <div className="mt-4 flex flex-wrap gap-4 border-y border-neutral-100 py-4 text-sm text-neutral-700">
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-4 w-4" />
                      {property.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {property.bathrooms}
                    </span>
                    <span>{property.size}</span>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#fff8d2] p-4">
                    <p className="text-[11px] font-black uppercase tracking-wide">
                      Investment Score
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[#d5a900]">★★★★★</span>
                      <span className="font-black">{property.score}</span>
                    </div>
                    <p className="mt-1 text-right text-sm font-bold text-green-700">
                      {property.rating}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-neutral-600">
                      {property.offers}
                    </span>
                  </div>

                  <Link
                    href={`/properties/${property.id}/make-offer`}
                    className="mt-4 block rounded-xl border-2 border-[#ffd400] bg-[#ffd400] px-4 py-3 text-center text-sm font-black transition hover:bg-[#ffdf33]"
                  >
                    Submit Offer
                  </Link>

                  <p className="mt-2 text-center text-[11px] font-semibold text-neutral-500">
                    RM500 Commitment Fee
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/properties"
              className="inline-flex rounded-xl bg-black px-8 py-4 font-black text-white transition hover:bg-neutral-800"
            >
              Browse More Properties
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#c59f00]">
            Simple and structured
          </p>

          <h2 className="mt-2 text-3xl font-black">How Bidje Works</h2>

          <p className="mt-3 leading-7 text-neutral-600">
            Buyers submit qualified offers through Bidje. Financing and loan
            arrangements remain the buyer&apos;s own responsibility.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number}>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-lg font-black text-[#ffd400]">
                  {step.number}
                </div>
                <h3 className="mt-4 text-lg font-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-[#fff8d2] p-5 text-sm leading-6 text-neutral-700">
            The RM500 commitment fee supports a serious and structured offer
            process. Final refund conditions and payment terms will be displayed
            before payment.
          </div>
        </div>
      </section>

      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div key={benefit.title}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ffd400]">
                  <Icon className="h-6 w-6 text-[#ffd400]" />
                </div>
                <h3 className="mt-4 font-black">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}