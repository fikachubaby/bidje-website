"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import type { FinancingConsultant } from "@/hooks/useFinancialView";

interface FinancialAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    editConsultant?: FinancingConsultant | null;
}

export function FinancialAddModal({
    isOpen,
    onClose,
    onSuccess,
    editConsultant,
}: FinancialAddModalProps) {
    const [name, setName] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editConsultant) {
            setName(editConsultant.name || "");
            setIsActive(editConsultant.is_active);
        } else {
            setName("");
            setIsActive(true);
        }
        setError(null);
    }, [editConsultant, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Consultant name is required.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const isEditing = !!editConsultant;
            const url = "/api/admin/financings";
            const method = isEditing ? "PUT" : "POST";

            const payload = {
                ...(isEditing && { id: editConsultant.id }),
                name: name.trim(),
                is_active: isActive,
            };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                onSuccess(
                    isEditing
                        ? "Financing consultant updated successfully!"
                        : "Financing consultant created successfully!"
                );
                onClose();
            } else {
                setError(data.error || "Failed to save financing consultant.");
            }
        } catch (err) {
            console.error("Error saving consultant:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container max-w-md">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <h3 className="text-base font-bold text-neutral-900">
                        {editConsultant ? "Edit Financing Consultant" : "Add Financing Consultant"}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {error && (
                        <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
                            {error}
                        </div>
                    )}

                    <FormInput
                        label="Consultant Name *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Acme Financial Advisory"
                        required
                    />

                    <FormSelect
                        label="Status"
                        value={isActive ? "Active" : "Inactive"}
                        onChange={(e) => setIsActive(e.target.value === "Active")}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </FormSelect>

                    <div className="modal-footer pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="rounded-lg border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : editConsultant ? "Update Consultant" : "Create Consultant"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}