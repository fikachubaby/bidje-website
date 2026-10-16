"use client";

import { useEffect, useState } from "react";
import { FormInput } from "@/components/admin/ui/FormField";

const formatter = new Intl.NumberFormat("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatMoney(value: number) {
    return formatter.format(value || 0);
}

interface MoneyInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
}

/** Ringgit amount field shown as 1,500,000.00; commas are added while typing. */
export function MoneyInput({ label, value, onChange }: MoneyInputProps) {
    const [text, setText] = useState(formatMoney(value));
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        if (!focused) setText(formatMoney(value));
    }, [value, focused]);

    const handleChange = (raw: string) => {
        // Keep digits and one decimal point, max 2 decimals.
        const cleaned = raw.replace(/[^\d.]/g, "");
        const [whole = "", ...rest] = cleaned.split(".");
        const decimals = rest.join("").slice(0, 2);
        const hasDot = cleaned.includes(".");
        const wholeFormatted = whole ? Number(whole).toLocaleString("en-MY") : "";
        setText(hasDot ? `${wholeFormatted || "0"}.${decimals}` : wholeFormatted);
        onChange(Number(`${whole || 0}.${decimals || 0}`));
    };

    return (
        <FormInput
            label={label}
            inputMode="decimal"
            value={text}
            placeholder="0.00"
            onFocus={() => {
                setFocused(true);
                if (!value) setText("");
            }}
            onBlur={() => {
                setFocused(false);
                setText(formatMoney(value));
            }}
            onChange={(e) => handleChange(e.target.value)}
        />
    );
}
