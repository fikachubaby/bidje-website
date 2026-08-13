import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.bidje.com";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/api/",
                    "/admin/",
                    "/login",
                    "/signup",
                    "/*/make-offer",
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}