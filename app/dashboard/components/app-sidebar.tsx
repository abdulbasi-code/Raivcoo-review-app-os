// components/app-sidebar.tsx

"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  LogOut,
  FolderOpenDot,
  SquareUser,
  LayoutDashboard,
  Home,
  ChevronDown,
  Puzzle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RevButtons } from "@/components/ui/RevButtons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useLinkStatus } from "next/link";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AccountForm, { AccountData } from "../../account/AccountForm";
import { updateAccount } from "../../account/actions";
import PasswordSection from "../../account/PasswordSection";
import Image from "next/image";

interface ProfileShowProps {
  portfolio: AccountData;
  hasPasswordAuth: boolean;
  webVersion: string;
  extensionVersion: string;
}

function LinkStatus({ href }: { href: string }) {
  const { pending } = useLinkStatus();
  const pathname = usePathname();

  // Only skip the loading indicator if we're on the exact same path
  if (pathname === href) {
    return null;
  }

  return pending ? (
    <div className="flex flex-col items-center">
      <svg
        className="size-4 text-purple-600 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  ) : null;
}

export function AppSidebar({
  portfolio,
  hasPasswordAuth,
  webVersion,
  extensionVersion,
}: ProfileShowProps) {
  const pathname = usePathname();
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);

  // Check if we're in a specific section (more precise than just startsWith)
  const isActiveSection = (path: string) => {
    // For main dashboard, only highlight when exactly on dashboard
    if (path === "/dashboard") {
      return pathname === "/dashboard";
    }

    // For other sections, match if we're on that exact path or any nested path
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <Sidebar collapsible="icon">
      {/* Logo/Website Header - Top */}
      <SidebarHeader className="border-b p-0 m-0 bg-background">
        <div className="flex items-center py-0 m-0 gap-2 group-data-[collapsible=icon]:px-2 px-3 h-[49px] relative">
          <Avatar className="h-8 w-8 rounded-lg border-2">
            <AvatarImage
              src={portfolio?.avatar_url || ""}
              alt={portfolio?.display_name || "User"}
            />

            <AvatarFallback className="bg-muted rounded-none">
              <Image
                width={40}
                height={40}
                src="/avif/user-profile-avatar.avif"
                loading="lazy"
                alt="Avatar"
              />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium truncate">
              {portfolio?.display_name || "No display name"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {portfolio?.email || "No email"}
              {/* ravicoo@gmail.com */}
            </span>
          </div>

          {/* User dropdown menu */}
          <div className="absolute group-data-[collapsible=icon]:hidden right-3 top-1/2 -translate-y-1/2">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <RevButtons size={"icon"} variant={"ghost"} title="User Menu">
                  <div className="flex items-center">
                    <ChevronDown className="h-3 w-3 transition-transform duration-200 data-[state=open]:rotate-180" />
                  </div>
                </RevButtons>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setAccountDialogOpen(true)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <SquareUser className="h-4 w-4" />
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form
                    action="/auth/signout"
                    method="post"
                    className="flex items-center gap-2 w-full cursor-pointer"
                  >
                    <button
                      type="submit"
                      className="flex items-center gap-2 w-full"
                    >
                      <LogOut className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Sign out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="space-y-[-15px]">
        {/* 🟡 MAIN */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="text-xs mb-2 mt-1 font-medium text-muted-foreground px-2 group-data-[collapsible=icon]:hidden">
              Dashboard
            </div>

            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" className="w-full">
                  <SidebarMenuButton
                    className={cn(
                      "flex items-center w-full group-data-[collapsible=icon]:justify-center",
                      isActiveSection("/dashboard") && "bg-muted"
                    )}
                  >
                    <div className="w-8 h-8 flex items-center justify-center border-2 rounded-md bg-[#581C87]/40 text-[#C084FC] shrink-0">
                      <LayoutDashboard className="size-4" />
                    </div>
                    <span className="group-data-[collapsible=icon]:hidden">
                      Main
                    </span>
                    <div className="group-data-[collapsible=icon]:hidden">
                      <LinkStatus href="/dashboard" />
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* PROJECTS SECTION */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard/projects" className="w-full">
                  <SidebarMenuButton
                    className={cn(
                      "flex items-center w-full group-data-[collapsible=icon]:justify-center",
                      isActiveSection("/dashboard/projects") && "bg-muted"
                    )}
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-md border-2 bg-[#064E3B]/40 text-[#10B981] shrink-0">
                      <FolderOpenDot className="w-4 h-4" />
                    </div>
                    <span className="group-data-[collapsible=icon]:hidden">
                      Projects
                    </span>
                    <div className="group-data-[collapsible=icon]:hidden">
                      <LinkStatus href="/dashboard/projects" />
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* EXTENSIONS SECTION */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard/extensions" className="w-full">
                  <SidebarMenuButton
                    className={cn(
                      "flex items-center w-full group-data-[collapsible=icon]:justify-center",
                      isActiveSection("/dashboard/extensions") && "bg-muted"
                    )}
                  >
                    <div className="w-8 h-8 flex items-center justify-center border-2 rounded-md bg-[#4B1D5B]/40 text-[#A87FC0] shrink-0">
                      <Puzzle className="w-4 h-4" />
                    </div>
                    <span className="group-data-[collapsible=icon]:hidden">
                      Extensions
                    </span>
                    <div className="group-data-[collapsible=icon]:hidden">
                      <LinkStatus href="/dashboard/extensions" />
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t mt-auto px-4 py-3 group-data-[collapsible=icon]:hidden">
        {/* Versions */}
        <div className="text-xs text-muted-foreground font-medium space-y-1">
          <div className="flex justify-between">
            <span>
              Web App: <span className="text-foreground">v{webVersion}</span>
            </span>
            <span>
              Extension:{" "}
              <span className="text-foreground">v{extensionVersion}</span>
            </span>
          </div>
        </div>
      </SidebarFooter>

      {/* Account Dialog */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Account Settings</DialogTitle>
          </DialogHeader>
          {portfolio && (
            <>
              <AccountForm Account={portfolio} updateAccount={updateAccount} />
              <PasswordSection
                hasPassword={!!hasPasswordAuth}
                email={portfolio.email || ""}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}