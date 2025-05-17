import type { NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// RegExp for public files
const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  // Handle Supabase session update
  const res = await updateSession(req);

  const url = req.nextUrl.clone();

  // Skip public files and API routes
  if (
    PUBLIC_FILE.test(url.pathname) ||
    url.pathname.startsWith("/_next") ||
    url.pathname.includes("/api/")
  ) {
    return res;
  }

  // Just return the updated session response
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
