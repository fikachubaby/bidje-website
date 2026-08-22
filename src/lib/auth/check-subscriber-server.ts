import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUBSCRIBER_ROLES, UserRole } from "@/types/user";

export async function checkIsSubscriber(): Promise<boolean> {
    try {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Called from Server Component
                        }
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!profile || !profile.role) return false;

        return SUBSCRIBER_ROLES.includes(profile.role as UserRole);
    } catch (error) {
        console.error("Error verifying subscriber status:", error);
        return false;
    }
}