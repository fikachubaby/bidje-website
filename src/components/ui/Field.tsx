import React from "react";
import { cn } from "@/lib/utils";

export function inputClass(error?: string) {
    return cn(
        "w-full rounded-xl border bg-white px-4 py-3 text-sm text-black outline-none transition-colors placeholder:text-neutral-400 focus:border-brand focus:ring-2 focus:ring-brand/20",
        error ? "border-red-400" : "border-neutral-200"
    );
}

interface FieldProps {
    label: string;
    id: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}

export function Field({ label, id, error, required, children }: FieldProps) {
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-black">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </label>
            {children}
            {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
        </div>
    );
}