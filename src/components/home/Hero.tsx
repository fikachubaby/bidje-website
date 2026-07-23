import Image from "next/image";
import { Check } from "lucide-react";
import { SearchBar } from "@/components/home/SearchBar";
import type { Property } from "@/types/property";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80";

interface HeroProps {
  featuredProperty?: Property;
}

export function Hero({ featuredProperty }: HeroProps) {
  const heroImage = featuredProperty?.imageUrl ?? HERO_IMAGE_URL;

  return (
    <section className="relative overflow-hidden bg-brand pb-28 pt-10 sm:pb-32 sm:pt-14 lg:pb-36">
      <div
        className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full border-[3px] border-black/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 top-24 h-96 w-96 rounded-full border-[3px] border-black/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-32 left-1/3 h-48 w-48 rounded-full border-[3px] border-black/10"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-black">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              Homes for sale across Malaysia
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-black sm:text-5xl lg:text-6xl">
              A happier way to find your next property.
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-black/80 sm:text-xl">
              Browse verified properties, connect directly and move forward with
              confidence.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {["Verified listings", "Direct enquiries"].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-black/10 bg-brand-muted px-4 py-2 text-sm font-semibold text-black"
                >
                  <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-lg lg:justify-self-end">
            <div className="relative rotate-[-4deg] rounded-[2rem] border-[3px] border-black bg-white p-3 shadow-[8px_8px_0_0_#000] transition-transform hover:rotate-[-2deg]">
              <div
                className="absolute -left-3 -top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-black bg-black text-lg"
                aria-hidden="true"
              >
                <span className="text-brand">☺</span>
              </div>

              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem]">
                <Image
                  src={heroImage}
                  alt={
                    featuredProperty?.title ??
                    "Beautiful modern home ready to discover"
                  }
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 480px"
                  priority
                />
              </div>

              <div className="mt-3 flex items-end justify-between gap-3 px-1 pb-1">
                <span className="rounded-full border-2 border-black bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-black">
                  Fresh Pick
                </span>
                <p className="text-right text-sm font-semibold text-black">
                  Beautiful homes, ready to discover
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
        <SearchBar />
      </div>
    </section>
  );
}
