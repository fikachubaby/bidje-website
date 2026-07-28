"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmitOfferModalProps {
  open: boolean;
  onClose: () => void;
  propertyTitle: string;
}

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  offerAmount: string;
  purchaseMethod: string;
  message: string;
  confirmed: boolean;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  offerAmount?: string;
  purchaseMethod?: string;
  confirmed?: string;
}

const PURCHASE_METHODS = [
  { value: "", label: "Select purchase method" },
  { value: "cash", label: "Cash" },
  { value: "bank-financing", label: "Bank financing" },
  { value: "other", label: "Other" },
];

function formatOfferInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-MY");
}

function parseOfferAmount(value: string): number {
  return Number(value.replace(/\D/g, ""));
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required";
  }

  if (!data.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^(\+?60|0)1[0-9]{8,9}$/.test(data.phone.replace(/[\s-]/g, ""))) {
    errors.phone = "Enter a valid Malaysian phone number";
  }

  if (!data.email.trim()) {
    errors.email = "Email address is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email address";
  }

  const amount = parseOfferAmount(data.offerAmount);
  if (!data.offerAmount.trim()) {
    errors.offerAmount = "Offer amount is required";
  } else if (amount <= 0) {
    errors.offerAmount = "Offer amount must be greater than zero";
  }

  if (!data.purchaseMethod) {
    errors.purchaseMethod = "Please select a purchase method";
  }

  if (!data.confirmed) {
    errors.confirmed = "You must confirm the accuracy of your information";
  }

  return errors;
}

const initialForm: FormData = {
  fullName: "",
  phone: "",
  email: "",
  offerAmount: "",
  purchaseMethod: "",
  message: "",
  confirmed: false,
};

export function SubmitOfferModal({
  open,
  onClose,
  propertyTitle,
}: SubmitOfferModalProps) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  function handleClose() {
    setForm(initialForm);
    setErrors({});
    setSubmitted(false);
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
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
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/60 p-4 sm:items-center">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="submit-offer-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="submit-offer-title"
              className="text-2xl font-bold text-black"
            >
              Submit Offer
            </h2>
            <p className="mt-1 text-sm text-neutral-500">{propertyTitle}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-black"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="mt-8 rounded-2xl border border-brand/30 bg-brand-muted/50 p-6 text-center">
            <p className="text-base font-semibold text-black">
              Your offer has been prepared successfully. Database submission
              will be connected next.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 w-full rounded-2xl bg-brand py-3.5 text-sm font-bold text-black transition-colors hover:bg-brand-dark"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <Field
              label="Full name"
              id="fullName"
              error={errors.fullName}
              required
            >
              <input
                id="fullName"
                type="text"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className={inputClass(errors.fullName)}
                placeholder="Enter your full name"
              />
            </Field>

            <Field
              label="Malaysian phone number"
              id="phone"
              error={errors.phone}
              required
            >
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={inputClass(errors.phone)}
                placeholder="e.g. 012-345 6789"
              />
            </Field>

            <Field label="Email address" id="email" error={errors.email} required>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={inputClass(errors.email)}
                placeholder="you@example.com"
              />
            </Field>

            <Field
              label="Offer amount (RM)"
              id="offerAmount"
              error={errors.offerAmount}
              required
            >
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-500">
                  RM
                </span>
                <input
                  id="offerAmount"
                  type="text"
                  inputMode="numeric"
                  value={form.offerAmount}
                  onChange={(e) =>
                    updateField("offerAmount", formatOfferInput(e.target.value))
                  }
                  className={cn(inputClass(errors.offerAmount), "pl-12")}
                  placeholder="0"
                />
              </div>
            </Field>

            <Field
              label="Purchase method"
              id="purchaseMethod"
              error={errors.purchaseMethod}
              required
            >
              <select
                id="purchaseMethod"
                value={form.purchaseMethod}
                onChange={(e) => updateField("purchaseMethod", e.target.value)}
                className={inputClass(errors.purchaseMethod)}
              >
                {PURCHASE_METHODS.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Message (optional)" id="message">
              <textarea
                id="message"
                rows={3}
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                className={inputClass()}
                placeholder="Any additional details for the seller..."
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
                  I confirm that the information provided is accurate and I
                  agree to be contacted regarding this offer.
                </span>
              </label>
              {errors.confirmed && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.confirmed}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-2xl border border-neutral-200 py-3.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-brand py-3.5 text-sm font-bold text-black transition-colors hover:bg-brand-dark"
              >
                Submit Offer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function inputClass(error?: string) {
  return cn(
    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-brand focus:ring-2 focus:ring-brand/20",
    error ? "border-red-400" : "border-neutral-200"
  );
}

function Field({
  label,
  id,
  error,
  required,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-black">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
