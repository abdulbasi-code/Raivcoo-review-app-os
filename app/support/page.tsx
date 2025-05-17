import React from "react";
import SupportPage from "./SupportPage";
import { Metadata } from "next";
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Support Center - Test",
  description: "Get help or report issues with Test. ",
};
function page() {
  return <SupportPage />;
}

export default page;
