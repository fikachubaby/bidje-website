import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Bath,
  Bed,
  Info,
  MapPin,
  Maximize,
  Ruler,
} from "lucide-react";
import { BidjeRatingCard } from "@/components/property/BidjeRatingCard";
import { PropertyFinancialEstimates } from "@/components/property/PropertyFinancialEstimates";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { PropertyOfferSection } from "@/components/property/PropertyOfferSection";
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

  const images =
    property.images && property.images.length > 0
      ? property.images
      : [property.imageUrl];

  const detailItems = [
    {
      label: "Category",
      value: formatCategory(property.category),
    },
    ...(property.bedrooms !== undefined
      ? [{ label: "Bedrooms", value: String(property.bedrooms) }]
      : []),
    ...(property.bathrooms !== undefined
      ? [{ label: "Bathrooms", value: String(property.bathrooms) }]
      : []),
    { label: "Built-up area", value: formatArea(property.areaSqft) },
    ...(property.landSize
      ? [{ label: "Land size", value: property.landSize }]
      : []),
    ...(property.tenure ? [{ label: "Tenure", value: property.tenure }] : []),
    ...(property.bumiStatus
      ? [{ label: "Bumi status", value: property.bumiStatus }]
      : []),
  ];

  const importantItems = [
    ...(property.tenure
      ? [{ label: "Tenure", value: property.tenure }]
      : []),
    ...(property.bumiStatus
      ? [{ label: "Bumi status", value: property.bumiStatus }]
      : []),
    {
      label: "Listing status",
      value: property.urgentSale ? "Urgent sale" : "Available",
    },
  ];

  return (
    <div className="bg-white pb-28 lg:pb-16">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listings
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-3 lg:gap-10">
          {/* Main content — ~2/3 width */}
          <div className="space-y-6 lg:col-span-2">
            <PropertyGallery
              propertyId={property.id}
              title={property.title}
              images={images}
              urgentSale={property.urgentSale}
            />

            {/* Price & overview */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Asking Price
              </p>
              <p className="mt-1 text-3xl font-extrabold text-black sm:text-4xl">
                {formatPrice(property.price, property.currency)}
              </p>

              <PropertyFinancialEstimates
                marketValue={property.marketValue}
                maxLoanApplicable={property.maxLoanApplicable}
                currency={property.currency}
                className="mt-4 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4"
              />

              <h1 className="mt-4 text-2xl font-bold leading-tight text-black sm:text-3xl">
                {property.title}
              </h1>

              <p className="mt-3 flex items-center gap-2 text-neutral-600">
                <MapPin className="h-4 w-4 shrink-0 text-brand-dark" />
                {property.location}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <StatPill icon={<Ruler className="h-4 w-4" />}>
                  {formatCategory(property.category)}
                </StatPill>
                {property.bedrooms !== undefined && (
                  <StatPill icon={<Bed className="h-4 w-4" />}>
                    {property.bedrooms} Bed
                  </StatPill>
                )}
                {property.bathrooms !== undefined && (
                  <StatPill icon={<Bath className="h-4 w-4" />}>
                    {property.bathrooms} Bath
                  </StatPill>
                )}
                <StatPill icon={<Maximize className="h-4 w-4" />}>
                  {formatArea(property.areaSqft)}
                </StatPill>
                {property.landSize && (
                  <StatPill icon={<Ruler className="h-4 w-4" />}>
                    {property.landSize}
                  </StatPill>
                )}
              </div>
            </div>

            {property.bidjeScore !== undefined && (
              <BidjeRatingCard score={property.bidjeScore} />
            )}

            <DetailSection title="About this property">
              <p className="whitespace-pre-line leading-relaxed text-neutral-700">
                {property.description}
              </p>
            </DetailSection>

            <DetailSection title="Property details">
              <dl className="grid gap-4 sm:grid-cols-2">
                {detailItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-neutral-100 bg-neutral-50/50 px-4 py-3"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      {item.label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-black">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </DetailSection>

            <DetailSection title="Location">
              <div className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-dark" />
                <div>
                  <p className="font-semibold text-black">{property.location}</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Exact address available upon enquiry
                  </p>
                </div>
              </div>
            </DetailSection>

            {importantItems.length > 0 && (
              <DetailSection title="Important information">
                <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-neutral-400" />
                  <dl className="grid flex-1 gap-3 sm:grid-cols-2">
                    {importantItems.map((item) => (
                      <div key={item.label}>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          {item.label}
                        </dt>
                        <dd className="mt-0.5 text-sm font-medium text-black">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </DetailSection>
            )}
          </div>

          {/* Sidebar — ~1/3 width */}
          <div className="lg:col-span-1">
            <PropertyOfferSection
              propertyId={property.id}
              title={property.title}
              price={property.price}
              currency={property.currency}
              verifiedOfferCount={property.verifiedOfferCount}
              marketValue={property.marketValue}
              maxLoanApplicable={property.maxLoanApplicable}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-medium text-neutral-700">
      <span className="text-brand-dark">{icon}</span>
      {children}
    </span>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-black">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
