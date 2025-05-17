import { Metadata } from "next";
import React from "react";



export const metadata: Metadata = {
  title: "Reset Password - test",
  description:
    "Set a new password for your test account and get back to showcasing your video editing portfolio.",
};

function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div> {children}</div>;
}

export default layout;
