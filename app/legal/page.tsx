import { Metadata } from "next";
import { FC } from "react";
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Legal - Terms of Service & Privacy Policy - test",
  description:
    "Read test's legal policies including the Terms of Service and Privacy Policy. Understand the rules, responsibilities, and how your personal data is handled while using Raivcoo.",
};
const page: FC = () => (
  <div>
    <h1 className="text-3xl font-bold mb-6">Legal Documents</h1>
    <p className="mb-4">
      Welcome to the legal section of test. Here you can find important
      information about how to use our service and how we handle your data.
    </p>
    <p className="mb-4">Please select a document from the sidebar to view:</p>
    <ul className="list-disc pl-6">
      <li>Terms of Service - Our rules and guidelines for using test</li>
      <li>
        Privacy Policy - How we collect, use, and protect your personal
        information
      </li>
    </ul>
  </div>
);

export default page;
