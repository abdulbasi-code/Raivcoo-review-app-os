import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/complete-profile",
      },
    ],
    sitemap: `${process.env.DOMAIN_URL}/sitemap.xml`,
  };
}
