import { Metadata } from "next";
import { DotPatternBg } from "../components/backgrounds/backgrounds";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password - test",
  description:
    "Forgot your password? Reset it here to regain access to your test account and portfolio.",
};

export default function ForgotPasswordPage() {
  return (
    <DotPatternBg>
      <ForgotPasswordForm />
    </DotPatternBg>
  );
}
