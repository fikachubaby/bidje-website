"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  Phone,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  History
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/ButtonProps";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { validateOfferPrice } from "@/lib/offers/validateOffer";
import { OfferDetailsModal } from "@/components/ui/OfferDetailsModal";
import { OfferHistoryModal } from "@/components/ui/OfferHistoryModal";
import type { AdminProperty } from "@/types/property";
import type { BuyerOffer, OfferStatus } from "@/types/offer";

interface OffersViewProps {
  offers: BuyerOffer[];
  properties: AdminProperty[];
  loading?: boolean;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalCount: number;
  search: string;
  setSearch: (search: string) => void;
  statusFilter: OfferStatus | "All";
  setStatusFilter: (status: OfferStatus | "All") => void;
  onUpdateStatus: (id: string, status: OfferStatus) => void;
}

export function OffersView({
  offers,
  properties,
  loading = false,
  page,
  setPage,
  totalPages,
  totalCount,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onUpdateStatus,
}: OffersViewProps) {
  const [offerErrors, setOfferErrors] = useState<Record<string, string>>({});
  const [selectedOfferForDetails, setSelectedOfferForDetails] = useState<BuyerOffer | null>(null);
  const [selectedOfferForHistory, setSelectedOfferForHistory] = useState<BuyerOffer | null>(null);

  function isPendingTooLong(createdAt: string): boolean {
    const hoursElapsed = (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    return hoursElapsed > 48;
  }

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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
          <Search className="h-5 w-5 shrink-0 text-neutral-400" />
          <FormInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by buyer name, phone, email, or property..."
            className="mt-0 border-0 px-0 py-0 shadow-none focus:border-transparent"
          />
        </div>
        <FormSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OfferStatus | "All")}
          className="mt-0 sm:w-48"
        >
          <option value="All">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </FormSelect>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1020px] w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-5 py-4 font-bold text-neutral-600">Buyer Details</th>
                <th className="px-5 py-4 font-bold text-neutral-600">Property</th>
                <th className="px-5 py-4 font-bold text-neutral-600">Offer Amount</th>
                <th className="px-5 py-4 font-bold text-neutral-600">Status & Reminder</th>
                <th className="px-5 py-4 font-bold text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-neutral-500">
                    Loading offers from database...
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-neutral-500">
                    No buyer offers match your filter criteria.
                  </td>
                </tr>
              ) : (
                offers.map((offer) => {
                  const property = properties.find((item) => item.id === offer.propertyId);
                  const offerError = offerErrors[offer.id];
                  const needsAttention = offer.status === "Pending" && isPendingTooLong(offer.createdAt);

                  return (
                    <tr key={offer.id} className="border-b border-neutral-100 last:border-0 align-top">
                      <td className="px-5 py-4">
                        <p className="font-bold text-neutral-900">{offer.buyerName}</p>
                        <div className="mt-1 flex flex-col gap-1 text-xs text-neutral-500">
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" /> {offer.buyerPhone}
                          </span>
                          {offer.buyerEmail && (
                            <span className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5" /> {offer.buyerEmail}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-neutral-900">
                          {property ? property.name : "Property unavailable"}
                        </p>
                        {property && (
                          <p className="text-xs text-neutral-400 mt-0.5">
                            {property.district}, {property.state}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-black text-neutral-900">{formatPrice(offer.amount)}</p>
                        {property?.minimumPrice && (
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Min: {formatPrice(property.minimumPrice)}
                          </p>
                        )}
                        {offerError && (
                          <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                            <AlertTriangle className="h-3 w-3 shrink-0" /> {offerError}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          <StatusBadge status={offer.status} />
                          {needsAttention && (
                            <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 border border-amber-200">
                              <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                              <span>Pending &gt; 48h</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOfferForDetails(offer)}
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-neutral-50"
                          >
                            <Eye className="h-3.5 w-3.5" /> Details
                          </button>
                          <a
                            href={`tel:${offer.buyerPhone}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-neutral-50"
                          >
                            <Phone className="h-3.5 w-3.5" /> Call
                          </a>
                          <button
                            type="button"
                            onClick={() => setSelectedOfferForHistory(offer)}
                            className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs font-semibold hover:bg-neutral-50"
                          >
                            <History className="h-3.5 w-3.5" /> History
                          </button>
                          {offer.status === "Pending" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAccept(offer, property)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(offer.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-neutral-500">
          Showing page <span className="font-semibold text-neutral-800">{page}</span> of{" "}
          <span className="font-semibold text-neutral-800">{totalPages}</span> (Total: {totalCount} offers)
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setPage(Math.max(page - 1, 1))}
            disabled={page <= 1 || loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button
            variant="secondary"
            onClick={() => setPage(Math.min(page + 1, totalPages))}
            disabled={page >= totalPages || loading}
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Render Reusable Modals */}
      <OfferDetailsModal
        offer={selectedOfferForDetails}
        onClose={() => setSelectedOfferForDetails(null)}
        onViewDocument={(title, url) => window.open(url, "_blank")}
      />

      <OfferHistoryModal
        offer={selectedOfferForHistory}
        onClose={() => setSelectedOfferForHistory(null)}
      />
    </div>
  );
}