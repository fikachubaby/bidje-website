import { redirect } from "next/navigation";

// Profile details now live inside Settings.
export default function ProfilePage() {
    redirect("/settings");
}
