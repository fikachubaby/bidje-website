import { supabase } from "@/lib/supabase/supabase";
import { parseOfferAmount } from "@/lib/offers/validateOffer";
import type { FormData } from "@/lib/offers/pendingOffer";

export interface SubmitOfferParams {
    propertyId: string;
    userId: string;
    data: FormData;
}

export interface SubmitOfferResult {
    success: boolean;
    error?: string;
}

export async function submitOfferToSupabase({
    propertyId,
    userId,
    data,
}: SubmitOfferParams): Promise<SubmitOfferResult> {
    const { error } = await supabase.from("offers").insert({
        property_id: propertyId,
        user_id: userId,
        offer_price: parseOfferAmount(data.offerAmount),
        contact_phone: data.phone,
    });

    if (error) {
        if (error.message.includes("Price offered is lower than loan balance")) {
            return { success: false, error: "Price offered is lower than loan balance" };
        }
        return { success: false, error: "Failed to submit offer. Please try again." };
    }

    return { success: true };
}