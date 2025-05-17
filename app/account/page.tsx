// app/Account/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AccountForm from "./AccountForm";
import { updateAccount } from "./actions";
import { Metadata } from "next";
import PasswordSection from "./PasswordSection";
import Image from "next/image";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Account - TEST",
  description: "Manage your TEST Account, update personal information.",
};

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: Account } = await supabase
    .from("editor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Check if user has password auth
  const hasPasswordAuthFromIdentities = user.identities?.some(
    (identity) =>
      identity.provider === "email" &&
      identity.identity_data?.email === user.email
  );

  // User has a password if either source indicates it
  const hasPasswordAuth =
    Account?.has_password || hasPasswordAuthFromIdentities;
  return (
    <div className=" min-h-screen  flex flex-col ">
      <header className="border-b px-4 py-2">
        <div className="container max-w-screen-2xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/MainLogo.png"
              alt="TEST Logo"
              width={50}
              height={50}
              className="rounded-[5px]"
              priority
              quality={100}
            />
          </Link>
          <Link
            href="/support"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Support
          </Link>
        </div>
      </header>
      <div className="justify-center items-center p-3 md:p-0 flex">
        <Card className="container mt-10  ">
          <CardContent className="p-6 space-y-8">
            <AccountForm Account={Account} updateAccount={updateAccount} />

            <PasswordSection
              hasPassword={!!hasPasswordAuth}
              email={user.email || ""}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
