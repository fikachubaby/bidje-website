"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth/useSession";
import {
  savePendingOffer,
  clearPendingOffer,
} from "@/lib/offers/pendingOffer";
import { submitOfferToSupabase } from "@/lib/offers/submitOffer";
import type { FormData, FormErrors } from "@/lib/offers/pendingOffer";
import { checkEmailExists } from "@/lib/offers/checkEmail";

import { SubmitOfferModalProps } from "./SubmitOfferModal.types";
import { PURCHASE_METHODS, initialForm } from "./SubmitOfferModal.constants";
import { formatOfferInput, validateForm } from "@/lib/offers/validateOffer";
import { Field, inputClass } from "@/components/ui/Field";
import { translate as t } from "@/lib/i18n/getTranslation";
type TranslationKey = Parameters<typeof t>[0];

export function SubmitOfferModal({
  open,
  onClose,
  propertyId,
  propertyTitle,
  minimumPrice,
  prefill,
  autoSubmit,
}: SubmitOfferModalProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();

  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitOffer = useCallback(async (data: FormData) => {
    if (!user) return;

    setLoading(true);
    const result = await submitOfferToSupabase({
      propertyId,
      userId: user.id,
      data,
    });

    setLoading(false);

    if (!result.success) {
      setErrors({ offerAmount: result.error });
      return;
    }

    clearPendingOffer();
    setSubmitted(true);

    // Redirect registered member to dashboard on success
    setTimeout(() => {
      router.push("/dashboard");
    }, 400);
  }, [propertyId, user, router]);

  useEffect(() => {
    if (!open || !prefill) return;

    const restored: FormData = {
      fullName: prefill.fullName,
      phone: prefill.phone,
      email: prefill.email,
      offerAmount: prefill.offerAmount,
      purchaseMethod: prefill.purchaseMethod,
      message: prefill.message,
      confirmed: prefill.confirmed,
      deposit: prefill.deposit,
      financingConsultantId: prefill.financingConsultantId,
      legalFirmId: prefill.legalFirmId,
    };

    setForm(restored);

    if (autoSubmit && user) {
      void submitOffer(restored);
    }
  }, [open, prefill, autoSubmit, user, submitOffer]);

  if (!open) return null;

  function handleClose() {
    if (loading) return;
    setForm(initialForm);
    setErrors({});
    setSubmitted(false);
    setRedirecting(false);
    setLoading(false);
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationErrors = validateForm(form, minimumPrice);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    if (sessionLoading) return;

    // 1. If user is logged in, submit directly to Supabase and route to dashboard
    if (user) {
      await submitOffer(form);
      return;
    }

    // 2. If user is NOT logged in, save draft to sessionStorage and route to signup/login
    setLoading(true);
    const emailExists = await checkEmailExists(form.email);
    setLoading(false);

    savePendingOffer({ propertyId, ...form });
    setRedirecting(true);

    setTimeout(() => {
      const destination = emailExists ? "/login" : "/signup";
      window.location.href = `${destination}?next=${encodeURIComponent(pathname)}`;
    }, 600);
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as keyof FormErrors];
        return next;
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-offer-title"
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <h2 id="submit-offer-title" className="text-2xl font-bold text-black">
              {t("SubmitOfferModal.title")}
            </h2>
            <p className="mt-1 text-sm text-neutral-500">{propertyTitle}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black disabled:opacity-50"
            aria-label={t("SubmitOfferModal.closeAriaLabel")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 pr-1">
          {redirecting || loading ? (
            <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <p className="mt-4 text-sm font-semibold text-black">
                {redirecting
                  ? t("SubmitOfferModal.redirectingMessage")
                  : t("SubmitOfferModal.submittingMessage")}
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                {t("SubmitOfferModal.redirectingSubtext")}
              </p>
            </div>
          ) : submitted ? (
            <div className="mt-8 rounded-2xl border border-brand/30 bg-brand-muted/50 p-6 text-center">
              <p className="text-base font-semibold text-black">
                {t("SubmitOfferModal.successMessage")}
              </p>
              <p className="mt-2 text-xs text-neutral-500">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="submit-offer-form" className="space-y-5" noValidate>
              <Field label={t("SubmitOfferModal.fields.fullName.label")} id="fullName" error={errors.fullName} required>
                <input
                  id="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className={inputClass(errors.fullName)}
                  placeholder={t("SubmitOfferModal.fields.fullName.placeholder")}
                />
              </Field>

              <Field label={t("SubmitOfferModal.fields.phone.label")} id="phone" error={errors.phone} required>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className={inputClass(errors.phone)}
                  placeholder={t("SubmitOfferModal.fields.phone.placeholder")}
                />
              </Field>

              <Field label={t("SubmitOfferModal.fields.email.label")} id="email" error={errors.email} required>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={inputClass(errors.email)}
                  placeholder={t("SubmitOfferModal.fields.email.placeholder")}
                />
              </Field>

              <Field label="Deposit" id="deposit" error={errors.deposit} required>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">
                    RM
                  </span>
                  <input
                    id="deposit"
                    type="text"
                    inputMode="numeric"
                    value={form.deposit}
                    onChange={(e) => updateField("deposit", formatOfferInput(e.target.value))}
                    className={cn(inputClass(errors.deposit), "pl-12")}
                    placeholder="0.00"
                  />
                </div>
              </Field>

              <Field label={t("SubmitOfferModal.fields.offerAmount.label")} id="offerAmount" error={errors.offerAmount} required>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">
                    {t("SubmitOfferModal.fields.offerAmount.currencyPrefix")}
                  </span>
                  <input
                    id="offerAmount"
                    type="text"
                    inputMode="numeric"
                    value={form.offerAmount}
                    onChange={(e) => updateField("offerAmount", formatOfferInput(e.target.value))}
                    className={cn(inputClass(errors.offerAmount), "pl-12")}
                    placeholder={t("SubmitOfferModal.fields.offerAmount.placeholder")}
                  />
                </div>
              </Field>

              <Field label={t("SubmitOfferModal.fields.purchaseMethod.label")} id="purchaseMethod" error={errors.purchaseMethod} required>
                <select
                  id="purchaseMethod"
                  value={form.purchaseMethod}
                  onChange={(e) => updateField("purchaseMethod", e.target.value)}
                  className={inputClass(errors.purchaseMethod)}
                >
                  {PURCHASE_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {t(method.labelKey as TranslationKey)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Financing Consultant" id="financingConsultant" error={errors.financingConsultantId}>
                <select
                  id="financingConsultant"
                  value={form.financingConsultantId}
                  onChange={(e) => updateField("financingConsultantId", e.target.value)}
                  className={inputClass(errors.financingConsultantId)}
                >
                  <option value="">Select financing consultant (Optional)</option>
                </select>
              </Field>

              <Field label="Legal Firm" id="legalFirm" error={errors.legalFirmId}>
                <select
                  id="legalFirm"
                  value={form.legalFirmId}
                  onChange={(e) => updateField("legalFirmId", e.target.value)}
                  className={inputClass(errors.legalFirmId)}
                >
                  <option value="">Select legal firm (Optional)</option>
                </select>
              </Field>

              <Field label={t("SubmitOfferModal.fields.message.label")} id="message">
                <textarea
                  id="message"
                  rows={3}
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  className={inputClass()}
                  placeholder={t("SubmitOfferModal.fields.message.placeholder")}
                />
              </Field>

              <div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.confirmed}
                    onChange={(e) => updateField("confirmed", e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand accent-brand"
                  />
                  <span className="text-sm leading-relaxed text-neutral-600">
                    {t("SubmitOfferModal.fields.confirmed.label")}
                  </span>
                </label>
                {errors.confirmed && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.confirmed}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        {!redirecting && !submitted && (
          <div className="flex flex-col-reverse gap-3 pt-4 border-t border-neutral-100 sm:flex-row">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 rounded-2xl border border-neutral-200 py-3.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
            >
              {t("SubmitOfferModal.cancelButton")}
            </button>
            <button
              type="submit"
              form="submit-offer-form"
              disabled={loading}
              className="flex items-center justify-center gap-2 flex-1 rounded-2xl bg-brand py-3.5 text-sm font-bold text-black transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("SubmitOfferModal.submitButton")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}