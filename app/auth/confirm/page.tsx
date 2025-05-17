import { DotPatternBg } from "@/app/components/backgrounds/backgrounds";
import EmailConfirmationPage from "./EmailConfirmationPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confirm Email - test",
  description:
    "Verify your email address to complete your test account setup and start building your portfolio.",
};

export default function SignUpPage() {
  return (
    <DotPatternBg>
      <EmailConfirmationPage />
    </DotPatternBg>
  );
}
