import { AdminPropertyInput } from "@/types/property";

export function validatePropertyForm(form: AdminPropertyInput): string | null {
    if (!form.name.trim()) {
        return "Property name is required.";
    }
    if (form.price <= 0) {
        return "Please enter a valid price.";
    }
    if ((form.minimumPrice ?? 0) > form.price) {
        return "Minimum acceptable price cannot exceed the asking price.";
    }
    if (!form.address.trim() || !form.state.trim() || !(form.district ?? "").trim()) {
        return "Address, state, and district are required.";
    }
    return null;
}