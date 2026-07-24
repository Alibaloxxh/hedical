import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/account", "/login", "/signup", "/admin", "/auth/", "/internal/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
