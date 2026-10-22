import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                        response = NextResponse.next({ request });
                        response.cookies.set(name, value, options);
                    });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (request.nextUrl.pathname.startsWith("/admin")) {
        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin" && profile?.role !== "staff") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    if (request.nextUrl.pathname.startsWith("/investor")) {
        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (!["investor", "admin", "staff"].includes(profile?.role ?? "")) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    if ((request.nextUrl.pathname.startsWith("/profile") || request.nextUrl.pathname.startsWith("/wishlist") || request.nextUrl.pathname.startsWith("/settings")) && !user) {
        return NextResponse.redirect(new URL(`/login?next=${request.nextUrl.pathname}`, request.url));
    }

    // Investors get their own portfolio dashboard instead of the subscriber one.
    if (request.nextUrl.pathname.startsWith("/dashboard") && user) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role === "investor") {
            return NextResponse.redirect(new URL("/investor", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: ["/admin/:path*", "/dashboard/:path*", "/investor/:path*", "/profile/:path*", "/wishlist/:path*", "/settings/:path*"],
};