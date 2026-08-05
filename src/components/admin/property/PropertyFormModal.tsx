"use client";

import { FormEvent, useEffect, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
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

const defaultFormState: AdminPropertyInput = {
  name: "",
  price: 0,
  address: "",
  state: "",
  district: "",
  propertyType: "Terrace",
  tenure: "Freehold",
  bumiStatus: "Non Bumi",
  landSize: "",
  builtUp: "",
  bedrooms: 3,
  bathrooms: 2,
  description: "",
  mapsUrl: "",
  images: [],
  status: "Draft",
};

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
  const [form, setForm] = useState<AdminPropertyInput>(defaultFormState);
  const [imageInput, setImageInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    if (editingProperty) {
      setForm({
        name: editingProperty.name || "",
        price: editingProperty.price || 0,
        address: editingProperty.address || "",
        state: editingProperty.state || "",
        district: editingProperty.district || "",
        propertyType: editingProperty.propertyType || "Terrace",
        tenure: editingProperty.tenure || "Freehold",
        bumiStatus: editingProperty.bumiStatus || "Non Bumi",
        landSize: editingProperty.landSize || "",
        builtUp: editingProperty.builtUp || "",
        bedrooms: editingProperty.bedrooms || 0,
        bathrooms: editingProperty.bathrooms || 0,
        description: editingProperty.description || "",
        mapsUrl: editingProperty.mapsUrl || "",
        images: Array.isArray(editingProperty.images) ? editingProperty.images : [],
        status: editingProperty.status || "Draft",
      });
    } else {
      setForm(defaultFormState);
    }

    setImageInput("");
    setError("");
  }, [open, editingProperty]);

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Property name is required.");
      return;
    }
    if (form.price <= 0) {
      setError("Please enter a valid price.");
      return;
    }
    if (!form.address.trim() || !form.state.trim() || !form.district.trim()) {
      setError("Address, state, and district are required.");
      return;
    }

    onSave({ ...form, images: form.images || [] });
  }

  const isEditing = Boolean(editingProperty);
  const currentImages = form.images || [];

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

        <FormField label="Price (RM)" htmlFor="price">
          <FormInput
            id="price"
            type="number"
            min={0}
            value={form.price || ""}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
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
            value={form.district}
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
            value={form.landSize}
            onChange={(e) => setForm({ ...form, landSize: e.target.value })}
            placeholder="e.g. 20 x 70 ft"
          />
        </FormField>

        <FormField label="Built up" htmlFor="builtUp">
          <FormInput
            id="builtUp"
            value={form.builtUp}
            onChange={(e) => setForm({ ...form, builtUp: e.target.value })}
            placeholder="e.g. 1,650 sqft"
          />
        </FormField>

        <FormField label="Bedrooms" htmlFor="bedrooms">
          <FormInput
            id="bedrooms"
            type="number"
            min={0}
            value={form.bedrooms}
            onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
          />
        </FormField>

        <FormField label="Bathrooms" htmlFor="bathrooms">
          <FormInput
            id="bathrooms"
            type="number"
            min={0}
            value={form.bathrooms}
            onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
          />
        </FormField>

        <FormField label="Google Maps URL" wide htmlFor="mapsUrl">
          <FormInput
            id="mapsUrl"
            type="url"
            value={form.mapsUrl}
            onChange={(e) => setForm({ ...form, mapsUrl: e.target.value })}
            placeholder="https://maps.google.com/..."
          />
        </FormField>

        <FormField
          label="Images"
          wide
          hint="Add image URLs one at a time."
        >
          <div className="mt-2 flex gap-2">
            <FormInput
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImage();
                }
              }}
              placeholder="https://example.com/image.jpg"
              className="mt-0"
            />
            <AdminButton type="button" variant="secondary" onClick={addImage}>
              <ImagePlus className="h-4 w-4" />
              Add
            </AdminButton>
          </div>
          {currentImages.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {currentImages.map((url, index) => (
                <li
                  key={`${url}-${index}`}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 px-3 py-2 text-sm"
                >
                  <span className="min-w-0 flex-1 truncate text-neutral-600">{url}</span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-red-600"
                    aria-label="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </FormField>

        <FormField label="Description" wide htmlFor="description">
          <FormTextarea
            id="description"
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the property, nearby amenities, and key selling points."
          />
        </FormField>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 md:col-span-2">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 md:col-span-2">
          <AdminButton type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </AdminButton>
          <AdminButton type="submit">
            {isEditing ? "Save changes" : "Create property"}
          </AdminButton>
        </div>
      </form>
    </Modal>
  );
}