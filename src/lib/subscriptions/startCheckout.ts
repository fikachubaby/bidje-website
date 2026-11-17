import { postToGateway } from "@/lib/payments/postToGateway";

/** After sign-in, the dashboard billing tab starts the Fiuu checkout on its own. */
export const SUBSCRIBE_NEXT = "/dashboard?tab=billing&subscribe=1";

/** Starts the subscription payment and sends the browser to Fiuu. Throws with a readable message on failure. */
export async function startSubscriptionCheckout() {
    const res = await fetch("/api/subscription/checkout", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not start payment");
    postToGateway(data.checkout.actionUrl, data.checkout.fields);
}
