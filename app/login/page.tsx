// app/login/page.tsx
import LoginForm from "./LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - test",
  description:
    "Login to your test account to manage your video editing workspace and client projects.",
};

export default function LoginPage() {
  return <LoginForm />;
}
