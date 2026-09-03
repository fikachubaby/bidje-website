"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { FormInput } from "@/components/admin/ui/FormField";

interface LegalFirm {
    id?: string;
    name: string;
    is_active?: boolean;
    isActive?: boolean;
    contact_person?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: string;
}

interface LegalAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
    editFirm?: LegalFirm | null;
}

export function LegalAddModal({ isOpen, onClose, onSuccess, editFirm }: LegalAddModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        isActive: true,
    });
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (editFirm) {
            setFormData({
                name: editFirm.name || "",
                contactPerson: editFirm.contact_person || editFirm.contactPerson || "",
                email: editFirm.email || "",
                phone: editFirm.phone || "",
                address: editFirm.address || "",
                isActive: editFirm.is_active ?? editFirm.isActive ?? true,
            });
        } else {
            setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", isActive: true });
        }
    }, [editFirm, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage("");

        try {
            const url = "/api/admin/legals";
            const method = editFirm?.id ? "PUT" : "POST";
            const payload = editFirm?.id ? { id: editFirm.id, ...formData } : formData;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const contentType = response.headers.get("content-type");
            const result = contentType && contentType.includes("application/json") ? await response.json() : {};

            if (!response.ok) {
                throw new Error(result.error || "Failed to save legal firm");
            }

            const successMsg = editFirm?.id ? "Legal firm updated successfully!" : "Legal firm added successfully!";

            onClose();
            onSuccess(successMsg);
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : "An unexpected error occurred";
            setErrorMessage(errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3 className="text-lg font-bold text-neutral-900">
                        {editFirm ? "Edit Legal Firm" : "Add New Legal Firm"}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="modal-close-btn"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {errorMessage && (
                    <div className="mt-4 alert-danger">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                        <label className="form-label-uppercase">Firm Name *</label>
                        <FormInput
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Smith & Co. Advocates"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="form-label-uppercase">Contact Person</label>
                            <FormInput
                                value={formData.contactPerson}
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                placeholder="e.g., John Smith"
                            />
                        </div>
                        <div>
                            <label className="form-label-uppercase">Phone Number</label>
                            <FormInput
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="e.g., +60123456789"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label-uppercase">Email Address</label>
                        <FormInput
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="e.g., contact@smithlaw.com"
                        />
                    </div>

                    <div>
                        <label className="form-label-uppercase">Office Address</label>
                        <FormInput
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="e.g., Suite 12-A, Legal Tower, KL"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-neutral-700">
                            Active status
                        </label>
                    </div>

                    <div className="modal-footer">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Saving..." : editFirm ? "Update Firm" : "Save Firm"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}