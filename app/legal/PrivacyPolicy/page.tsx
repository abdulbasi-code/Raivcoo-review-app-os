import React from "react";
import { Metadata } from "next";
import Privacy from "./Privacy";
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Privacy Policy | test - Video Portfolio Platform",
  description:
    "Read our privacy policy to understand how test handles your personal data and protects your privacy.",
  openGraph: {
    title: "Privacy Policy | test",
    description: "Understanding how we protect your privacy at test",
    type: "website",
    siteName: "test",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | test",
    description: "Understanding how we protect your privacy at test",
  },
};

function page() {
  return (
    <>
      <Privacy />
    </>
  );
}

export default page;
