import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MakeOfferClient } from "@/components/property/MakeOfferClient";
import { getPropertyById } from "@/lib/properties";

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
    <div className="bg-white pb-16">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8 lg:max-w-6xl lg:px-8">
        <Link
          href={`/properties/${property.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to property
        </Link>

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
  );
}
