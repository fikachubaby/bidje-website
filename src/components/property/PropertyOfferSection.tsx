"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { SubmitOfferModal } from "@/components/property/SubmitOfferModal";
import { formatPrice } from "@/lib/utils";

interface PropertyOfferSectionProps {
  title: string;
  price: number;
  currency: string;
  verifiedOfferCount?: number;
}

export function PropertyOfferSection({
  title,
  price,
  currency,
  verifiedOfferCount,
}: PropertyOfferSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);

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
            onSubmit={() => setModalOpen(true)}
          />
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-full rounded-2xl bg-brand py-4 text-base font-bold text-black transition-colors hover:bg-brand-dark"
        >
          Submit Offer
        </button>
      </div>

      <SubmitOfferModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        propertyTitle={title}
      />
    </>
  );
}

function OfferCard({
  title,
  price,
  currency,
  verifiedOfferCount,
  onSubmit,
}: {
  title: string;
  price: number;
  currency: string;
  verifiedOfferCount?: number;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        Asking Price
      </p>
      <p className="mt-1 text-3xl font-extrabold text-black">
        {formatPrice(price, currency)}
      </p>

      <h2 className="mt-4 text-lg font-bold leading-snug text-black">
        {title}
      </h2>

      {verifiedOfferCount !== undefined && verifiedOfferCount > 0 && (
        <p className="mt-3 text-sm font-medium text-neutral-600">
          {verifiedOfferCount} verified offer
          {verifiedOfferCount !== 1 ? "s" : ""} received
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        className="mt-6 w-full rounded-2xl bg-brand py-4 text-base font-bold text-black transition-colors hover:bg-brand-dark"
      >
        Submit Offer
      </button>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-dark" />
        Secure submission — your details are protected
      </p>
    </div>
  );
}
