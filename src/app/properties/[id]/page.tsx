import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Bath, Bed, MapPin, Maximize } from "lucide-react";
import { getPropertyById } from "@/lib/properties";
import { formatArea, formatCategory, formatPrice } from "@/lib/utils";

interface PropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
          <Image
            src={property.imageUrl}
            alt={property.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        <div>
          <span className="inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            {formatCategory(property.category)}
          </span>
          <h1 className="mt-4 text-3xl font-bold text-neutral-900">
            {property.title}
          </h1>
          <p className="mt-2 flex items-center gap-2 text-neutral-500">
            <MapPin className="h-4 w-4" />
            {property.location}
          </p>
          <p className="mt-6 text-3xl font-bold text-brand">
            {formatPrice(property.price, property.currency)}
          </p>

          <div className="mt-6 flex flex-wrap gap-6 rounded-xl border border-neutral-200 p-5">
            {property.bedrooms !== undefined && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Bed className="h-5 w-5 text-brand" />
                <span>{property.bedrooms} Bedrooms</span>
              </div>
            )}
            {property.bathrooms !== undefined && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Bath className="h-5 w-5 text-brand" />
                <span>{property.bathrooms} Bathrooms</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Maximize className="h-5 w-5 text-brand" />
              <span>{formatArea(property.areaSqft)}</span>
            </div>
          </div>

          <p className="mt-8 leading-relaxed text-neutral-600">
            {property.description}
          </p>

          <button
            type="button"
            className="mt-8 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark sm:w-auto sm:px-10"
          >
            Contact Agent
          </button>
        </div>
      </div>
    </div>
  );
}
