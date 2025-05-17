"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex ml-10 space-x-4">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`transition-colors flex items-center space-x-1 ${
            (item.href === "/" && pathname === "/") ||
            (item.href !== "/" && pathname.startsWith(item.href))
              ? "text-purple-500 font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function NavDropdownItems() {
  const pathname = usePathname();

  return (
    <>
      {navItems.map((item) => (
        <DropdownMenuItem key={item.href} asChild>
          <Link
            href={item.href}
            className={`transition-colors flex items-center space-x-1 ${
              (item.href === "/" && pathname === "/") ||
              (item.href !== "/" && pathname.startsWith(item.href))
                ? "text-purple-500 font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{item.label}</span>
          </Link>
        </DropdownMenuItem>
      ))}
    </>
  );
}