"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Mail, Phone, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { validateOfferPrice } from "@/lib/offers/validateOffer";
import type { AdminProperty, BuyerOffer, OfferStatus } from "@/types/property";

interface OffersViewProps {
  offers: BuyerOffer[];
  properties: AdminProperty[];
  onUpdateStatus: (id: string, status: OfferStatus) => void;
}

export function OffersView({ offers, properties, onUpdateStatus }: OffersViewProps) {
  const [offerErrors, setOfferErrors] = useState<Record<string, string>>({});

  const sorted = [...offers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  function handleAccept(offer: BuyerOffer, property: AdminProperty | undefined) {
    if (property) {
      const result = validateOfferPrice({
        offerPrice: offer.amount,
        minimumPrice: property.minimumPrice,
      });

      if (!result.valid) {
        setOfferErrors((prev) => ({ ...prev, [offer.id]: result.error! }));
        return;
      }
    }

    setOfferErrors((prev) => {
      const next = { ...prev };
      delete next[offer.id];
      return next;
    });
    onUpdateStatus(offer.id, "Accepted");
  }

  function handleReject(offerId: string) {
    setOfferErrors((prev) => {
      const next = { ...prev };
      delete next[offerId];
      return next;
    });
    onUpdateStatus(offerId, "Rejected");
  }

  return (
    <div className="space-y-4">
      {sorted.length === 0 ? (
        <article className="rounded-2xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
          <p className="text-neutral-500">No buyer offers yet.</p>
        </article>
      ) : (
        sorted.map((offer) => {
          const property = properties.find((item) => item.id === offer.propertyId);
          const offerError = offerErrors[offer.id];

          return (
            <article
              key={offer.id}
              className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      {offer.id}
                    </p>
                    <StatusBadge status={offer.status} />
                  </div>

                  <h2 className="mt-2 text-xl font-black text-neutral-900">{offer.buyerName}</h2>

                  <p className="mt-1 text-sm text-neutral-500">
                    {property ? property.name : "Property unavailable"}
                  </p>

                  {property ? (
                    <p className="mt-1 text-sm text-neutral-400">
                      {property.district}, {property.state} · Listed at{" "}
                      {formatPrice(property.price)}
                      {property.minimumPrice ? (
                        <> · Min. accepted {formatPrice(property.minimumPrice)}</>
                      ) : null}
                    </p>
                  ) : null}

                  <p className="mt-4 text-3xl font-black text-neutral-900">
                    {formatPrice(offer.amount)}
                  </p>

                  {offer.message ? (
                    <p className="mt-4 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
                      {offer.message}
                    </p>
                  ) : null}

                  {offerError ? (
                    <p className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {offerError}
                    </p>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-500">
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {offer.buyerPhone}
                    </span>
                    {offer.buyerEmail ? (
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {offer.buyerEmail}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:flex-col lg:items-stretch">
                  <a href={`tel:${offer.buyerPhone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-bold hover:bg-neutral-50"
                  >
                  <Phone className="h-4 w-4" />
                  Call buyer
                </a>
                {offer.status === "Pending" ? (
                  <>
                    <AdminButton onClick={() => handleAccept(offer, property)}>
                      <CheckCircle2 className="h-4 w-4" />
                      Accept
                    </AdminButton>
                    <AdminButton
                      variant="danger"
                      onClick={() => handleReject(offer.id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </AdminButton>
                  </>
                ) : null}
              </div>
            </div>
            </article>
          );
        })
      )}
    </div >
  );
}