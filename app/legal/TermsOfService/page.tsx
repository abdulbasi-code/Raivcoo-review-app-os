import React from "react";

import { Metadata } from "next";
import Terms from "./Terms";
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Terms of Service | test - Video Portfolio Platform",
  description:
    "Read test's Terms of Service to understand your rights and responsibilities when using our video portfolio platform. Clear guidelines for content creation and sharing.",
  openGraph: {
    title: "Terms of Service | test",
    description: "Understanding your rights and responsibilities on test",
    type: "website",
    siteName: "test",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | test",
    description: "Understanding your rights and responsibilities on test",
  },
};

function page() {
  return (
    <>
      <Terms />
    </>
  );
}

export default page;
