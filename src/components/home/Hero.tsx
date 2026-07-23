import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80')] bg-cover bg-center opacity-20" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex items-center rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand">
            Malaysia&apos;s Property Marketplace
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Find Your Perfect{" "}
            <span className="text-brand">Property</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-neutral-300 sm:text-xl">
            Browse thousands of listings — from land and landed homes to high-rise
            units, commercial spaces, and auction deals.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/properties"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Browse Properties
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/list-property"
              className="inline-flex items-center justify-center rounded-full border border-neutral-600 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:border-brand hover:text-brand"
            >
              List Your Property
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: "10K+", label: "Listings" },
            { value: "5K+", label: "Happy Clients" },
            { value: "50+", label: "Locations" },
            { value: "98%", label: "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="text-2xl font-bold text-brand sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-neutral-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
