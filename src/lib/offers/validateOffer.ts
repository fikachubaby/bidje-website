import type { FormData, FormErrors } from "@/components/property/SubmitOfferModal.types";

interface ValidateOfferPriceParams {
    offerPrice: number;
    minimumPrice?: number;
}

export function validateOfferPrice({ offerPrice, minimumPrice }: ValidateOfferPriceParams) {
    if (minimumPrice && offerPrice < minimumPrice) {
        return {
            valid: false,
            error: `Offer price cannot be lower than the minimum price of RM ${minimumPrice.toLocaleString("en-MY")}`,
        };
    }
    return { valid: true };
}

export function formatOfferInput(value: string): string {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("en-MY");
}

export function parseOfferAmount(value: string): number {
    return Number(value.replace(/\D/g, ""));
}

export function validateForm(data: FormData, minimumPrice?: number): FormErrors {
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
    } else {
        const result = validateOfferPrice({ offerPrice: amount, minimumPrice });
        if (!result.valid) {
            errors.offerAmount = result.error;
        }
    }

    if (!data.purchaseMethod) {
        errors.purchaseMethod = "Please select a purchase method";
    }

    if (!data.confirmed) {
        errors.confirmed = "You must confirm the accuracy of your information";
    }

    return errors;
}