// app/auth/signout/route.ts

import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();

  await (await supabase).auth.signOut();

  return NextResponse.redirect(new URL("/", request.url), {
    status: 302,
  });
}
