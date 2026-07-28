import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PropertyFinancialEstimates } from "@/components/property/PropertyFinancialEstimates";
import { formatPrice } from "@/lib/utils";

interface PropertyOfferSectionProps {
  propertyId: string;
  title: string;
  price: number;
  currency: string;
  verifiedOfferCount?: number;
  marketValue?: number;
  maxLoanApplicable?: number;
}

export function PropertyOfferSection({
  propertyId,
  title,
  price,
  currency,
  verifiedOfferCount,
  marketValue,
  maxLoanApplicable,
}: PropertyOfferSectionProps) {
  const makeOfferHref = `/properties/${propertyId}/make-offer`;

  return (
    <>
      {/* Desktop sticky card */}
      <div className="hidden lg:block">
        <div className="sticky top-8">
          <OfferCard
            title={title}
            price={price}
            currency={currency}
            verifiedOfferCount={verifiedOfferCount}
            marketValue={marketValue}
            maxLoanApplicable={maxLoanApplicable}
            makeOfferHref={makeOfferHref}
          />
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <Link
          href={makeOfferHref}
          className="block w-full rounded-2xl bg-brand py-4 text-center text-base font-bold text-black transition-colors hover:bg-brand-dark"
        >
          Submit Offer
        </Link>
      </div>
    </>
  );
}

function OfferCard({
  title,
  price,
  currency,
  verifiedOfferCount,
  marketValue,
  maxLoanApplicable,
  makeOfferHref,
}: {
  title: string;
  price: number;
  currency: string;
  verifiedOfferCount?: number;
  marketValue?: number;
  maxLoanApplicable?: number;
  makeOfferHref: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Asking Price
      </p>
      <p className="mt-1 text-3xl font-extrabold text-black">
        {formatPrice(price, currency)}
      </p>

      <PropertyFinancialEstimates
        marketValue={marketValue}
        maxLoanApplicable={maxLoanApplicable}
        currency={currency}
        className="mt-4"
      />

      <h2 className="mt-4 text-lg font-bold leading-snug text-black">{title}</h2>

      {verifiedOfferCount !== undefined && verifiedOfferCount > 0 && (
        <p className="mt-3 text-sm font-medium text-neutral-600">
          {verifiedOfferCount} verified offer
          {verifiedOfferCount !== 1 ? "s" : ""} received
        </p>
      )}

      <Link
        href={makeOfferHref}
        className="mt-6 block w-full rounded-2xl bg-brand py-4 text-center text-base font-bold text-black transition-colors hover:bg-brand-dark"
      >
        Submit Offer
      </Link>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-dark" />
        Secure submission — your details are protected
      </p>
    </div>
  );
}
