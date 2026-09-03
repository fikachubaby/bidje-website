"use client";

import { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import {
    type AdminPropertyInput,
    type PropertyFormModalProps,
} from "@/types/property";
import {
    formatWithCommas,
    emptyPropertyInput,
} from "@/lib/utils/property-utils";
import { validatePropertyForm } from "@/lib/validations/validator";

export function usePropertyForm({
    open,
    editingProperty,
    onSave,
}: PropertyFormModalProps) {
    const [form, setForm] = useState<AdminPropertyInput>(emptyPropertyInput);
    const [priceInput, setPriceInput] = useState("");
    const [debtInput, setDebtInput] = useState("");
    const [minPriceInput, setMinPriceInput] = useState("");
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [docUploading, setDocUploading] = useState(false);
    const [docUploadError, setDocUploadError] = useState("");
    const [minPriceTouched, setMinPriceTouched] = useState(false);
    const [saving, setSaving] = useState(false);

    // Sync state when modal opens or editingProperty changes
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

        setError("");
        setUploadError("");
        setDocUploadError("");
        setMinPriceTouched(false);
    }, [open, editingProperty]);

    // Compute minimum price automatically unless manually overridden
    useEffect(() => {
        if (!minPriceTouched) {
            const computed = Math.max(0, (form.price || 0) - (form.outstandingDebt || 0));
            setForm((prev) => ({ ...prev, minimumPrice: computed }));
            setMinPriceInput(formatWithCommas(computed));
        }
    }, [form.price, form.outstandingDebt, minPriceTouched]);

    function addImageUrl(url: string) {
        setForm((prev) => ({
            ...prev,
            images: [...(prev.images || []), url],
        }));
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

    async function uploadFilesToApi(files: FileList | File[], isPdfOnly = false): Promise<string[]> {
        const uploadedUrls: string[] = [];

        for (const file of Array.from(files)) {
            if (isPdfOnly && file.type !== "application/pdf") {
                throw new Error("Only PDF files are allowed for property documents.");
            }

            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Failed to upload ${file.name}`);
            }

            uploadedUrls.push(data.url);
        }

        return uploadedUrls;
    }

    async function handleFileUpload(files: FileList | File[]) {
        if (!files || files.length === 0) return;

        setUploading(true);
        setUploadError("");

        try {
            const urls = await uploadFilesToApi(files);
            if (urls.length > 0) {
                setForm((prev) => ({
                    ...prev,
                    images: [...(prev.images || []), ...urls],
                }));
            }
        } catch (err) {
            setUploadError(err instanceof Error ? err.message : "Failed to upload images");
        } finally {
            setUploading(false);
        }
    }

    async function handleDocumentUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setDocUploading(true);
        setDocUploadError("");

        try {
            const urls = await uploadFilesToApi(files, true);
            if (urls.length > 0) {
                setForm((prev) => ({
                    ...prev,
                    documents: [...(prev.documents || []), ...urls],
                }));
            }
        } catch (err) {
            setDocUploadError(err instanceof Error ? err.message : "Failed to upload documents");
        } finally {
            setDocUploading(false);
            e.target.value = "";
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (saving) return;

        const validationError = validatePropertyForm(form);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");

        try {
            setSaving(true);
            await onSave({
                ...form,
                images: form.images || [],
                documents: form.documents || [],
                tags: form.tags || [],
            });
            toast.success(editingProperty ? "Property updated successfully" : "Property created successfully");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save property");
        } finally {
            setSaving(false);
        }
    }

    return {
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
        isEditing: Boolean(editingProperty),
    };
}