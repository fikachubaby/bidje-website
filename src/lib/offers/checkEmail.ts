import { supabase } from "@/lib/supabase/supabase";

export async function checkEmailExists(email: string): Promise<boolean> {
    if (!email || !email.trim()) return false;

    const { data, error } = await supabase.rpc("check_email_exists", {
        lookup_email: email.trim(),
    });

    if (error) {
        console.error("Error checking email existence:", error.message);
        return false;
    }

    return Boolean(data);
}