"use client";

import { Trash2, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import {
  FormField,
  FormInput,
  FormSelect,
  FormTextarea,
} from "@/components/admin/ui/FormField";
import { Modal } from "@/components/admin/ui/Modal";
import { ImageDropzone } from "@/components/admin/property/ImageDropzone";
import {
  PROPERTY_TYPES,
  PROPERTY_STATUSES,
  TENURE_TYPES,
  BUMI_STATUSES,
  type PropertyStatus,
  type PropertyType,
  type PropertyFormModalProps,
  type AdminPropertyInput,
} from "@/types/property";
import { formatWithCommas, parseCommaNumber } from "@/lib/utils/property-utils";
import { usePropertyForm } from "@/hooks/usePropertyForm";

export function PropertyFormModal(props: PropertyFormModalProps) {
  const { open, onClose } = props;
  const {
    form,
    setForm,
    priceInput,
    setPriceInput,
    debtInput,
    setDebtInput,
    minPriceInput,
    setMinPriceInput,
    error,
    uploading,
    uploadError,
    docUploading,
    docUploadError,
    saving,
    setMinPriceTouched,
    addImageUrl,
    removeImage,
    removeDocument,
    handleFileUpload,
    handleDocumentUpload,
    handleSubmit,
    isEditing,
  } = usePropertyForm(props);

  const currentImages = form.images || [];
  const currentDocuments = form.documents || [];

  return (
    <Modal
      open={open}
      onClose={onClose}
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
            onBlur={() => setPriceInput(formatWithCommas(form.price))}
            placeholder="e.g. 400,000"
          />
        </FormField>

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
            onBlur={() => setDebtInput(formatWithCommas(form.outstandingDebt))}
            placeholder="e.g. 20,000"
          />
        </FormField>

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
            onBlur={() => setMinPriceInput(formatWithCommas(form.minimumPrice))}
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

        <FormField label="Telegram Code" htmlFor="telegramCode">
          <FormInput
            id="telegramCode"
            value={form.telegramCode || ""}
            onChange={(e) => setForm({ ...form, telegramCode: e.target.value })}
            placeholder="CFN0012KL"
          />
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
            {TENURE_TYPES.map((tenure) => (
              <option key={tenure} value={tenure}>
                {tenure}
              </option>
            ))}
          </FormSelect>
        </FormField>

        <FormField label="Bumi / Non Bumi / Both" htmlFor="bumiStatus">
          <FormSelect
            id="bumiStatus"
            value={form.bumiStatus}
            onChange={(e) =>
              setForm({ ...form, bumiStatus: e.target.value as AdminPropertyInput["bumiStatus"] })
            }
          >
            {BUMI_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
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

        <FormField
          label="Images"
          wide
          hint="Upload photos by drag & drop, file selection, or URL. First image is used as cover."
        >
          <ImageDropzone
            images={currentImages}
            uploading={uploading}
            uploadError={uploadError}
            onUploadFiles={handleFileUpload}
            onAddUrl={addImageUrl}
            onRemoveImage={removeImage}
          />
        </FormField>

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

          {docUploadError && <p className="mt-2 text-sm text-red-600">{docUploadError}</p>}

          {currentDocuments.length > 0 && (
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
          )}
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

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 md:col-span-2">
            {error}
          </p>
        )}

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
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {saving ? "Saving..." : isEditing ? "Save changes" : "Create property"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}