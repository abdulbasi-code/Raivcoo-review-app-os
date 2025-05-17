import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RevButtons } from "@/components/ui/RevButtons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Menu,
  LogInIcon,
  UserPlus,
  AlertCircle,
  SquareUser,
  LogOut,
} from "lucide-react";
import React from "react";
import Image from "next/image";
import { NavLinks, NavDropdownItems } from "./NavComponents";


export default async function Header() {
  const supabase = createClient();
  const {
    data: { user },
  } = await (await supabase).auth.getUser();

  const { data: account } = !user?.id
    ? { data: null }
    : await (await supabase)
        .from("editor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
  return (
    <header
      className="fixed top-0 z-50 right-0 left-0 md:p-6
        transition-all duration-300"
    >
      <div
        className="mx-auto px-4 sm:px-6 md:rounded-[15px] lg:px-5 py-3 bg-background/50 border
backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/MainLogo.png"
                alt="test.com logo"
                priority
                width={40}
                height={40}
                className="hover:scale-105 transition-all duration-300"
              />
            </Link>

            <NavLinks />
          </div>

          <div className="flex items-center">
            {user ? (
              <>
                {account?.display_name ? (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <RevButtons
                        variant="ghost"
                        className="flex items-center space-x-2 hover:bg-accent/50 transition-colors"
                      >
                        <div className="relative">
                          <Avatar className="h-8 w-8 rounded-lg border-[1.8px]">
                            <AvatarImage
                              src={account?.avatar_url || ""}
                              loading="lazy"
                              alt={account?.display_name || "Avatar"}
                            />
                            <AvatarFallback className="bg-muted rounded-none">
                              <Image
                                width={32}
                                height={32}
                                src="/avif/user-profile-avatar.avif"
                                loading="lazy"
                                alt="Avatar"
                              />
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </RevButtons>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="font-medium">
                            @{account?.display_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem>
                        <Link
                          href={"/account"}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <SquareUser className="h-4 w-4" />
                          <span>Account</span>{" "}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <form action="/auth/signout" method="post">
                          <button
                            type="submit"
                            className="flex items-center text-red-600"
                          >
                            <LogOut className="mr-2 h-4 w-4" />{" "}
                            <span> Sign out</span>
                          </button>
                        </form>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/complete-profile">
                    <RevButtons
                      variant="ghost"
                      className="text-amber-500 flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Complete Profile
                    </RevButtons>
                  </Link>
                )}
              </>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link href="/signup">
                  <RevButtons variant="outline" className="border">
                    Sign up
                  </RevButtons>
                </Link>
                <Link href="/login">
                  <RevButtons variant="default">Log in</RevButtons>
                </Link>
              </div>
            )}

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <RevButtons variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </RevButtons>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <></>
                ) : (
                  <>
                    <DropdownMenuLabel className="font-light">
                      Account
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href="/signup" className="w-full flex items-center">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign up
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="w-full flex items-center">
                        <LogInIcon className="mr-2 h-4 w-4" />
                        Login
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuLabel className="font-light">
                  Navigation
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <NavDropdownItems />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}