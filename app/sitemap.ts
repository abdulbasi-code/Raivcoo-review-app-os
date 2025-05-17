import { MetadataRoute } from "next";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: `${process.env.DOMAIN_URL}`,
    },
    {
      url: `${process.env.DOMAIN_URL}/PrivacyPolicy`,
    },
    {
      url: `${process.env.DOMAIN_URL}/TermsOfService`,
    },
    {
      url: `${process.env.DOMAIN_URL}/dashboard`,
    },
    {
      url: `${process.env.DOMAIN_URL}/dashboard/clients`,
    },
    {
      url: `${process.env.DOMAIN_URL}/dashboard/projects`,
    },
    {
      url: `${process.env.DOMAIN_URL}/dashboard/account`,
    },
    //
    {
      url: `${process.env.DOMAIN_URL}/dashboard/extensions`,
    },
    {
      url: `${process.env.DOMAIN_URL}/dashboard/pending`,
    },
    {
      url: `${process.env.DOMAIN_URL}/dashboard/reviews`,
    },

    {
      url: `${process.env.DOMAIN_URL}/pricing`,
    },
    {
      url: `${process.env.DOMAIN_URL}/login`,
    },
    {
      url: `${process.env.DOMAIN_URL}/signup`,
    },
  ];
}
