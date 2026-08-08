import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { MakeOfferClient } from "@/components/property/MakeOfferClient";
import { getPropertyById } from "@/lib/properties/properties";
import { Navbar } from "@/components/layout/Navbar";

interface MakeOfferPageProps {
  params: Promise<{ id: string }>;
}

export default async function MakeOfferPage({ params }: MakeOfferPageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-black">
      <Navbar />
      <div className="bg-white pb-16">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 lg:max-w-6xl lg:px-8">
          <nav className="mb-6 flex items-center justify-between">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-bold text-neutral-700 shadow-sm transition-all hover:bg-neutral-100 hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Properties
            </Link>

            <div className="hidden items-center gap-2 text-xs font-semibold text-neutral-500 sm:flex">
              <Link href="/" className="hover:underline">Home</Link>
              <ChevronRight className="h-3 w-3 text-neutral-400" />
              <Link href="/properties" className="hover:underline">Properties</Link>
              <ChevronRight className="h-3 w-3 text-neutral-400" />
              <span className="max-w-[200px] truncate text-black">{property.title}</span>
            </div>
          </nav>

          <h1 className="mt-6 text-3xl font-extrabold text-black">Make an Offer</h1>
          <p className="mt-2 text-neutral-600">
            Review the process below before submitting your offer for{" "}
            <span className="font-semibold text-black">{property.title}</span>.
          </p>

          <MakeOfferClient
            property={{
              id: property.id,
              title: property.title,
              price: property.price,
              currency: property.currency,
              location: property.location,
              marketValue: property.marketValue,
              maxLoanApplicable: property.maxLoanApplicable,
            }}
          />
        </div>
      </div>
    </main>
  );
}
