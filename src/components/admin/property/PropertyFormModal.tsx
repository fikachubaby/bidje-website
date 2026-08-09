"use client";

import { FormEvent, useEffect, useState } from "react";
import { ImagePlus, Trash2, Loader2, Upload, FileText } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/admin/ui/FormField";
import { Modal } from "@/components/admin/ui/Modal";
import {
  PROPERTY_TYPES,
  PROPERTY_STATUSES,
  type AdminProperty,
  type AdminPropertyInput,
  type PropertyStatus,
  type PropertyType
} from "@/types/property";
import {
  formatWithCommas,
  parseCommaNumber,
  emptyPropertyInput,
} from "@/lib/utils/property-utils";

interface PropertyFormModalProps {
  open: boolean;
  editingProperty: AdminProperty | null;
  onClose: () => void;
  onSave: (input: AdminPropertyInput) => void;
}

export function PropertyFormModal({
  open,
  editingProperty,
  onClose,
  onSave,
}: PropertyFormModalProps) {
  const [form, setForm] = useState<AdminPropertyInput>(emptyPropertyInput);
  const [priceInput, setPriceInput] = useState("");
  const [debtInput, setDebtInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [docUploading, setDocUploading] = useState(false);
  const [docUploadError, setDocUploadError] = useState("");
  const [minPriceTouched, setMinPriceTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editingProperty) {
      const p = editingProperty.price || 0;
      const d = editingProperty.outstandingDebt || 0;
      const mp = editingProperty.minimumPrice || 0;

      setForm({
        ...emptyPropertyInput,
        ...editingProperty,
        images: Array.isArray(editingProperty.images) ? editingProperty.images : [],
        documents: Array.isArray(editingProperty.documents) ? editingProperty.documents : [],
        tags: Array.isArray(editingProperty.tags) ? editingProperty.tags : [],
      });

      setPriceInput(formatWithCommas(p));
      setDebtInput(formatWithCommas(d));
      setMinPriceInput(formatWithCommas(mp));
    } else {
      setForm(emptyPropertyInput);
      setPriceInput("");
      setDebtInput("");
      setMinPriceInput("");
    }

    setImageInput("");
    setError("");
    setUploadError("");
    setDocUploadError("");
    setMinPriceTouched(false);
  }, [open, editingProperty]);

  useEffect(() => {
    if (!minPriceTouched) {
      const computed = Math.max(0, (form.price || 0) - (form.outstandingDebt || 0));
      setForm((prev) => ({ ...prev, minimumPrice: computed }));
      setMinPriceInput(formatWithCommas(computed));
    }
  }, [form.price, form.outstandingDebt, minPriceTouched]);

  function handleClose() {
    onClose();
  }

  function addImage(e?: React.MouseEvent | React.KeyboardEvent) {
    if (e) e.preventDefault();
    const url = imageInput.trim();
    if (!url) return;

    setForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), url],
    }));
    setImageInput("");
  }

  function removeImage(index: number) {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  }

  function removeDocument(index: number) {
    setForm((prev) => ({
      ...prev,
      documents: (prev.documents || []).filter((_, i) => i !== index),
    }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError("");

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          setUploadError(data.error || `Failed to upload ${file.name}`);
          continue;
        }

        uploadedUrls.push(data.url);
      } catch {
        setUploadError(`Failed to upload ${file.name}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
    }

    setUploading(false);
    e.target.value = "";
  }

  async function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setDocUploading(true);
    setDocUploadError("");

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      if (file.type !== "application/pdf") {
        setDocUploadError("Only PDF files are allowed for property documents.");
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          setDocUploadError(data.error || `Failed to upload ${file.name}`);
          continue;
        }

        uploadedUrls.push(data.url);
      } catch {
        setDocUploadError(`Failed to upload ${file.name}`);
      }
    }

    if (uploadedUrls.length > 0) {
      setForm((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), ...uploadedUrls],
      }));
    }

    setDocUploading(false);
    e.target.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    if (!form.name.trim()) {
      setError("Property name is required.");
      return;
    }
    if (form.price <= 0) {
      setError("Please enter a valid price.");
      return;
    }
    if ((form.minimumPrice ?? 0) > form.price) {
      setError("Minimum acceptable price cannot exceed the asking price.");
      return;
    }
    if (!form.address.trim() || !form.state.trim() || !(form.district ?? "").trim()) {
      setError("Address, state, and district are required.");
      return;
    }

    try {
      setSaving(true);
      await onSave({
        ...form,
        images: form.images || [],
        documents: form.documents || [],
        tags: form.tags || [],
      });
    } finally {
      setSaving(false);
    }
  }

  const isEditing = Boolean(editingProperty);
  const currentImages = form.images || [];
  const currentDocuments = form.documents || [];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      wide
      title={isEditing ? "Edit property" : "Add property"}
      description="Complete all listing details. Save as Draft or publish immediately."
    >
      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <FormField label="Property name" wide htmlFor="name">
          <FormInput
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Modern Terrace House in Kajang"
          />
        </FormField>

        {/* PRICE FIELD WITH COMMA FORMATTING */}
        <FormField label="Price (RM)" htmlFor="price">
          <FormInput
            id="price"
            type="text"
            value={priceInput}
            onChange={(e) => {
              const rawVal = e.target.value;
              setPriceInput(rawVal);
              setForm({ ...form, price: parseCommaNumber(rawVal) });
            }}
            onBlur={() => {
              setPriceInput(formatWithCommas(form.price));
            }}
            placeholder="e.g. 400,000"
          />
        </FormField>

        {/* OUTSTANDING DEBT FIELD WITH COMMA FORMATTING */}
        <FormField label="Outstanding debt / loan balance (RM)" htmlFor="outstandingDebt">
          <FormInput
            id="outstandingDebt"
            type="text"
            value={debtInput}
            onChange={(e) => {
              const rawVal = e.target.value;
              setDebtInput(rawVal);
              setForm({ ...form, outstandingDebt: parseCommaNumber(rawVal) });
            }}
            onBlur={() => {
              setDebtInput(formatWithCommas(form.outstandingDebt));
            }}
            placeholder="e.g. 20,000"
          />
        </FormField>

        {/* MINIMUM PRICE FIELD WITH COMMA FORMATTING */}
        <FormField
          label="Minimum acceptable price (RM)"
          htmlFor="minimumPrice"
          hint="Auto-calculated as Price − Outstanding debt. Edit manually to override."
        >
          <FormInput
            id="minimumPrice"
            type="text"
            value={minPriceInput}
            onChange={(e) => {
              const rawVal = e.target.value;
              setMinPriceTouched(true);
              setMinPriceInput(rawVal);
              setForm({ ...form, minimumPrice: parseCommaNumber(rawVal) });
            }}
            onBlur={() => {
              setMinPriceInput(formatWithCommas(form.minimumPrice));
            }}
            placeholder="e.g. 380,000"
          />
        </FormField>

        <FormField label="Property type" htmlFor="propertyType">
          <FormSelect
            id="propertyType"
            value={form.propertyType}
            onChange={(e) =>
              setForm({ ...form, propertyType: e.target.value as PropertyType })
            }
          >
            {PROPERTY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </FormSelect>
        </FormField>

        <FormField label="Status" htmlFor="status">
          <FormSelect
            id="status"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as PropertyStatus })
            }
          >
            {PROPERTY_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </FormSelect>
        </FormField>

        <FormField label="Address" wide htmlFor="address">
          <FormInput
            id="address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Street address"
          />
        </FormField>

        <FormField label="State" htmlFor="state">
          <FormInput
            id="state"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            placeholder="e.g. Selangor"
          />
        </FormField>

        <FormField label="District" htmlFor="district">
          <FormInput
            id="district"
            value={form.district || ""}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            placeholder="e.g. Kajang"
          />
        </FormField>

        <FormField label="Tenure" htmlFor="tenure">
          <FormSelect
            id="tenure"
            value={form.tenure}
            onChange={(e) =>
              setForm({ ...form, tenure: e.target.value as AdminPropertyInput["tenure"] })
            }
          >
            <option value="Freehold">Freehold</option>
            <option value="Leasehold">Leasehold</option>
          </FormSelect>
        </FormField>

        <FormField label="Bumi / Non Bumi" htmlFor="bumiStatus">
          <FormSelect
            id="bumiStatus"
            value={form.bumiStatus}
            onChange={(e) =>
              setForm({ ...form, bumiStatus: e.target.value as AdminPropertyInput["bumiStatus"] })
            }
          >
            <option value="Bumi">Bumi</option>
            <option value="Non Bumi">Non Bumi</option>
          </FormSelect>
        </FormField>

        <FormField label="Land size" htmlFor="landSize">
          <FormInput
            id="landSize"
            value={form.landSize || ""}
            onChange={(e) => setForm({ ...form, landSize: e.target.value })}
            placeholder="e.g. 20 x 70 ft"
          />
        </FormField>

        <FormField label="Built up" htmlFor="builtUp">
          <FormInput
            id="builtUp"
            value={form.builtUp || ""}
            onChange={(e) => setForm({ ...form, builtUp: e.target.value })}
            placeholder="e.g. 1,650 sqft"
          />
        </FormField>

        <FormField label="Bedrooms" htmlFor="bedrooms">
          <FormInput
            id="bedrooms"
            type="number"
            min={0}
            value={form.bedrooms ?? 0}
            onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
          />
        </FormField>

        <FormField label="Bathrooms" htmlFor="bathrooms">
          <FormInput
            id="bathrooms"
            type="number"
            min={0}
            value={form.bathrooms ?? 0}
            onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
          />
        </FormField>

        <FormField
          label="Tags (Comma separated)"
          wide
          htmlFor="tags"
          hint="e.g. Corner Lot, Renovated, Near LRT"
        >
          <FormInput
            id="tags"
            value={form.tags ? form.tags.join(", ") : ""}
            onChange={(e) =>
              setForm({
                ...form,
                tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
              })
            }
            placeholder="Corner Lot, High Floor, Swimming Pool"
          />
        </FormField>

        <FormField label="Google Maps URL" wide htmlFor="mapsUrl">
          <FormInput
            id="mapsUrl"
            type="url"
            value={form.mapsUrl || ""}
            onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
            placeholder="https://maps.google.com/..."
          />
        </FormField>

        {/* IMAGES SECTION */}
        <FormField
          label="Images"
          wide
          hint="Upload photos, or paste an image URL. First image becomes the cover photo."
        >
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 ${uploading ? "pointer-events-none opacity-60" : ""
                }`}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Uploading…" : "Upload photos"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>

            <span className="text-xs text-neutral-400">or</span>

            <FormInput
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImage();
                }
              }}
              placeholder="Paste an image URL"
              className="mt-0 flex-1 min-w-[200px]"
            />
            <AdminButton type="button" variant="secondary" onClick={addImage}>
              <ImagePlus className="h-4 w-4" />
              Add
            </AdminButton>
          </div>

          {uploadError ? (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          ) : null}

          {currentImages.length > 0 ? (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {currentImages.map((url, index) => (
                <li
                  key={`${url}-${index}`}
                  className="group relative overflow-hidden rounded-xl border border-neutral-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Property photo ${index + 1}`}
                    className="h-24 w-full object-cover"
                  />
                  {index === 0 ? (
                    <span className="absolute left-1 top-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Cover
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 rounded-lg bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </FormField>

        {/* DOCUMENTS (PDF) SECTION */}
        <FormField
          label="Property Documents (PDF)"
          wide
          hint="Upload multiple PDF documents for staff reference (e.g., floor plans, titles, agreements)."
        >
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 ${docUploading ? "pointer-events-none opacity-60" : ""
                }`}
            >
              {docUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {docUploading ? "Uploading PDFs…" : "Upload PDF Documents"}
              <input
                type="file"
                accept="application/pdf"
                multiple
                className="hidden"
                onChange={handleDocumentUpload}
                disabled={docUploading}
              />
            </label>
          </div>

          {docUploadError ? (
            <p className="mt-2 text-sm text-red-600">{docUploadError}</p>
          ) : null}

          {currentDocuments.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2">
              {currentDocuments.map((url, index) => {
                const fileName = url.split("/").pop() || `Document ${index + 1}`;
                return (
                  <li
                    key={`${url}-${index}`}
                    className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-medium text-blue-600 hover:underline flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-neutral-500" />
                      {fileName}
                    </a>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="ml-2 rounded-lg p-1 text-neutral-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                      aria-label="Remove document"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </FormField>

        <FormField label="Description" wide htmlFor="description">
          <FormTextarea
            id="description"
            rows={5}
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the property, nearby amenities, and key selling points."
          />
        </FormField>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 md:col-span-2">
            {error}
          </p>
        ) : null}

        {/* internal staff notes */}
        <FormField
          label="Internal Notes (Staff Only)"
          wide
          htmlFor="internalNotes"
          hint="Private notes visible only to admins and agents."
        >
          <FormTextarea
            id="internalNotes"
            rows={3}
            value={form.internalNotes || ""}
            onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
            placeholder="Add remarks about vendor urgency, commission terms, etc."
          />
        </FormField>

        <div className="flex justify-end gap-3 md:col-span-2">
          <AdminButton type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Saving..." : isEditing ? "Save changes" : "Create property"}
          </AdminButton>
        </div>
      </form>
    </Modal>
  );
}