"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  Phone,
  XCircle,
  Search,
  Eye,
  Clock,
  History,
  ShieldCheck,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { PaginationDashboard } from "@/components/common/PaginationDashboard";
import { OfferDetailsModal } from "@/components/ui/OfferDetailsModal";
import { OfferHistoryModal } from "@/components/ui/OfferHistoryModal";
import { RejectRemarkModal } from "@/components/admin/offers/RejectRemarkModal";
import { useOffersView } from "@/hooks/useOffersView";
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
  onUpdateStatus: (id: string, status: OfferStatus, remark?: string) => void;
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
  const {
    offerErrors,
    selectedOfferForDetails,
    setSelectedOfferForDetails,
    selectedOfferForHistory,
    setSelectedOfferForHistory,
    rejectTarget,
    setRejectTarget,
    isPendingTooLong,
    handleApproveVerification,
    handleAcceptOffer,
    handleConfirmReject,
  } = useOffersView({ onUpdateStatus });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="search-input-wrapper">
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
          <option value="Submitted">Submitted</option>
          <option value="Pending Documents">Pending Upload</option>
          <option value="Under Verification">Under Verification</option>
          <option value="Verification Rejected">Action Required</option>
          <option value="Verified">Verified</option>
          <option value="Accepted">Accepted</option>
          <option value="Rejected">Rejected</option>
        </FormSelect>
      </div>

      <div className="admin-table-container">
        <div className="overflow-x-auto">
          <table className="min-w-255 w-full text-left text-sm">
            <thead className="admin-table-head">
              <tr>
                <th className="admin-table-th">Buyer Details</th>
                <th className="admin-table-th">Property</th>
                <th className="admin-table-th">Offer Amount</th>
                <th className="admin-table-th">Status & Reminder</th>
                <th className="admin-table-th">Actions</th>
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
                  const needsAttention =
                    (offer.status === "Under Verification" || offer.status === "Submitted") &&
                    isPendingTooLong(offer.createdAt);

                  return (
                    <tr key={offer.id} className="admin-table-tr align-top">
                      <td className="px-5 py-4">
                        <p className="font-bold text-neutral-900">{offer.buyerName}</p>
                        <div className="mt-1 flex flex-col gap-1 dashboard-subtext text-xs">
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
                          <p className="mt-0.5 text-xs text-neutral-400">
                            {property.district}, {property.state}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-black text-neutral-900">{formatPrice(offer.amount)}</p>
                        {property?.minimumPrice && (
                          <p className="mt-0.5 text-xs text-neutral-400">
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
                          {offer.status === "Verification Rejected" && offer.verificationRemark && (
                            <p className="max-w-55 text-xs text-red-600">
                              {offer.verificationRemark}
                            </p>
                          )}
                          {needsAttention && (
                            <div className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
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
                            className="admin-btn-action-default"
                          >
                            <Eye className="h-3.5 w-3.5" /> Details
                          </button>

                          <a href={`tel:${offer.buyerPhone}`} className="admin-btn-action-default">
                            <Phone className="h-3.5 w-3.5" /> Call
                          </a>

                          <button
                            type="button"
                            onClick={() => setSelectedOfferForHistory(offer)}
                            className="admin-btn-action-default"
                          >
                            <History className="h-3.5 w-3.5" /> History
                          </button>

                          {/* STAGE 1: Verify Documents */}
                          {offer.status === "Under Verification" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveVerification(offer.id)}
                                className="admin-btn-action-primary"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" /> Approve Verification
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectTarget({ id: offer.id, stage: "verification" })}
                                className="admin-btn-action-danger"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Reject Verification
                              </button>
                            </>
                          )}

                          {/* STAGE 2: Offer Evaluation */}
                          {offer.status === "Verified" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAcceptOffer(offer, property)}
                                className="admin-btn-action-success"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Accept Offer
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectTarget({ id: offer.id, stage: "offer" })}
                                className="admin-btn-action-danger"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Reject Offer
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

      <PaginationDashboard
        currentPage={page}
        totalPages={totalPages}
        totalItems={totalCount}
        pageSize={10}
        onPageChange={setPage}
      />

      <OfferDetailsModal
        offer={selectedOfferForDetails}
        onClose={() => setSelectedOfferForDetails(null)}
        onViewDocument={(_, url) => window.open(url, "_blank")}
      />

      <OfferHistoryModal
        offer={selectedOfferForHistory}
        onClose={() => setSelectedOfferForHistory(null)}
      />

      <RejectRemarkModal
        open={!!rejectTarget}
        title={
          rejectTarget?.stage === "verification"
            ? "Reject Document Verification"
            : "Reject Offer"
        }
        onCancel={() => setRejectTarget(null)}
        onConfirm={handleConfirmReject}
      />
    </div>
  );
}