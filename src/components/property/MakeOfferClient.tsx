"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { SubmitOfferModal } from "@/components/property/SubmitOfferModal";
import { PropertyFinancialEstimates } from "@/components/property/PropertyFinancialEstimates";
import { useSession } from "@/lib/auth/useSession";
import { loadPendingOffer, type PendingOfferDraft } from "@/lib/offers/pendingOffer";
import { formatPrice } from "@/lib/utils";

interface MakeOfferClientProps {
  property: {
    id: string;
    title: string;
    price: number;
    currency: string;
    location: string;
    marketValue?: number;
    maxLoanApplicable?: number;
    minimumPrice?: number;
  };
}

const OFFER_STEPS = [
  {
    title: "Review the property",
    description:
      "Review all property information, photos, location and important disclosures.",
  },
  {
    title: "Enter your offer",
    description:
      "Provide your contact details, proposed purchase price and purchase method.",
  },
  {
    title: "Pay the RM500 commitment fee",
    description:
      "The payment confirms that the offer is genuine and allows Bidje to process and present it to the seller.",
  },
  {
    title: "Seller reviews the offer",
    description:
      "Bidje will present the offer to the seller. The seller may accept, reject or propose different terms.",
  },
  {
    title: "Continue with the transaction",
    description:
      "When the offer is accepted, the buyer must cooperate with the documentation, financing, due-diligence and sale process.",
  },
] as const;

const COMMITMENT_FEE_TERMS = [
  "Payment does not guarantee that the seller will accept the offer.",
  "If the seller rejects the offer, the RM500 commitment fee will be refunded.",
  "If the property becomes unavailable before the seller accepts the offer, the RM500 commitment fee will be refunded.",
  "If the seller accepts the offer and the buyer later cancels or refuses to proceed without an agreed valid reason, the RM500 commitment fee will be forfeited and will not be refunded.",
  "Any refund processing period and administrative conditions will be stated in the final Commitment Fee Terms.",
  "Property purchase remains subject to verification, legal documentation, financing approval where applicable and the seller\u2019s final agreement.",
] as const;

const RISK_POINTS = [
  "Property information must be independently verified.",
  "Photos and descriptions may not represent the latest physical condition.",
  "Financing approval is not guaranteed.",
  "Legal ownership, restrictions, outstanding financing and title conditions must be checked.",
  "An accepted offer is not a replacement for legal documents or a Sale and Purchase Agreement.",
  "Bidje does not guarantee profit, investment returns or property value.",
] as const;

export function MakeOfferClient({ property }: MakeOfferClientProps) {
  const { user, loading: sessionLoading } = useSession();
  const [ackProcess, setAckProcess] = useState(false);
  const [ackRisk, setAckRisk] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumedDraft, setResumedDraft] = useState<PendingOfferDraft | null>(null);

  useEffect(() => {
    if (sessionLoading || !user) return;
    const draft = loadPendingOffer(property.id);
    if (draft) {
      setResumedDraft(draft);
      setAckProcess(true);
      setAckRisk(true);
      setModalOpen(true);
    }
  }, [sessionLoading, user, property.id]);

  const canContinue = ackProcess && ackRisk;

  function handleContinue() {
    if (!canContinue) return;
    setModalOpen(true);
  }

  const continueButtonClassName =
    "w-full rounded-2xl bg-brand py-4 text-base font-bold text-black transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      <div className="mt-8 space-y-6 pb-24 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8 lg:space-y-0 lg:pb-0">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
          <h2 className="text-lg font-bold text-black">Property summary</h2>
          <p className="mt-4 text-2xl font-extrabold text-black">
            {formatPrice(property.price, property.currency)}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Asking Price
          </p>
          <h3 className="mt-4 text-base font-bold text-black">{property.title}</h3>
          <p className="mt-1 text-sm text-neutral-600">{property.location}</p>

          <PropertyFinancialEstimates
            marketValue={property.marketValue}
            maxLoanApplicable={property.maxLoanApplicable}
            currency={property.currency}
            className="mt-5 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4"
          />
        </section>

        <div className="space-y-6 lg:col-start-1 lg:row-start-1">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-dark" />
            <div>
              <h2 className="text-lg font-bold text-black">Offer submission process</h2>
              <ol className="mt-4 list-decimal space-y-4 pl-5 text-sm leading-relaxed text-neutral-700">
                {OFFER_STEPS.map((step) => (
                  <li key={step.title}>
                    <span className="font-semibold text-black">{step.title}</span>
                    <br />
                    {step.description}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-black">RM500 Commitment Fee</h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-700">
            The RM500 payment is a commitment fee for submitting and processing your offer.
            It is not payment of the property purchase price and does not by itself create a
            Sale and Purchase Agreement.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-700">
            {COMMITMENT_FEE_TERMS.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h2 className="text-lg font-bold text-black">
                Important risks &amp; disclaimers
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-neutral-700">
                {RISK_POINTS.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-black">Acknowledgements</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Please confirm the following before proceeding to the offer form.
          </p>

          <div className="mt-5 space-y-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={ackProcess}
                onChange={(e) => setAckProcess(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand accent-brand"
              />
              <span className="text-sm leading-relaxed text-neutral-700">
                I have read and understood the offer process, RM500 commitment-fee terms and
                refund conditions.
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={ackRisk}
                onChange={(e) => setAckRisk(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand accent-brand"
              />
              <span className="text-sm leading-relaxed text-neutral-700">
                I understand that the payment does not guarantee acceptance of my offer or
                completion of the property purchase.
              </span>
            </label>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className={`mt-6 ${continueButtonClassName}`}
          >
            Continue to Offer Form
          </button>

          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            Payment integration will only be activated after the Commitment Fee Terms and
            refund policy have been legally reviewed.
          </p>
        </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className={continueButtonClassName}
        >
          Continue to Offer Form
        </button>
      </div>

      <SubmitOfferModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setResumedDraft(null);
        }}
        propertyId={property.id}
        propertyTitle={property.title}
        minimumPrice={property.minimumPrice}
        prefill={resumedDraft}
        autoSubmit={Boolean(resumedDraft)}
      />
    </>
  );
}
