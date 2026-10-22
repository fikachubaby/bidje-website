import { redirect } from "next/navigation";

// The wishlist now lives inside Settings.
export default function WishlistPage() {
    redirect("/settings#wishlist");
}
