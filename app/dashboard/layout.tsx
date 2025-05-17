// app/dashboard/layout.tsx

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { RevButtons } from "@/components/ui/RevButtons";
import { Film } from "lucide-react";
import { GlobalSearch } from "./projects/components/GlobalSearch";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: versionData, error } = await supabase
    .from("version_log")
    .select("platform, version")
    .in("platform", ["web", "extension"])
    .order("created_at", { ascending: false });

  // Fetch the existing portfolio data
  const { data: existingPortfolio, error: fetchError } = await supabase
    .from("editor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching portfolio:", fetchError);
    throw fetchError;
  }

  // Check if user has password auth
  const hasPasswordAuthFromIdentities = user.identities?.some(
    (identity) =>
      identity.provider === "email" &&
      identity.identity_data?.email === user.email
  );

  // User has a password if either source indicates it
  const hasPasswordAuth =
    existingPortfolio?.has_password || hasPasswordAuthFromIdentities;

  const webVersion =
    versionData?.find((v) => v.platform === "web")?.version || "1.0.0";

  const extensionVersion =
    versionData?.find((v) => v.platform === "extension")?.version || "1.0.0";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          portfolio={existingPortfolio}
          hasPasswordAuth={hasPasswordAuth}
          webVersion={webVersion}
          extensionVersion={extensionVersion}
        />
        <main className="w-full">
          <header className="bg-background border-b px-3 h-[50px] flex justify-between items-center sticky top-0 z-50">
            <span className="border-2 flex items-center justify-center rounded-md">
              <SidebarTrigger />
            </span>
            <div className="flex gap-2 items-center">
              {/* Global Search */}
              <GlobalSearch />

              {/* New Project button */}
              <Link href="/dashboard/projects/new">
                <RevButtons size={"sm"}>
                  <Film className="mr-2 h-4 w-4" />
                  New Project
                </RevButtons>
              </Link>
            </div>
          </header>
          <div className="px-4 bg-background">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}