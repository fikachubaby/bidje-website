"use client";

import { useState } from "react";

interface RejectRemarkModalProps {
    open: boolean;
    title: string;
    onCancel: () => void;
    onConfirm: (remark: string) => void;
}

export function RejectRemarkModal({
    open,
    title,
    onCancel,
    onConfirm,
}: RejectRemarkModalProps) {
    const [remark, setRemark] = useState("");
    if (!open) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container max-w-md">
                <h3 className="text-base font-bold text-neutral-900">{title}</h3>
                <p className="mt-1 text-xs text-neutral-500">
                    This reason will be shown to the buyer. Be specific (e.g. &quot;IC is
                    blurry, please re-upload&quot;).
                </p>
                <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    rows={3}
                    className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
                    placeholder="Reason for rejection..."
                />
                <div className="modal-footer border-t-0 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold hover:bg-neutral-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={!remark.trim()}
                        onClick={() => onConfirm(remark.trim())}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-40"
                    >
                        Confirm Rejection
                    </button>
                </div>
            </div>
        </div>
    );
}