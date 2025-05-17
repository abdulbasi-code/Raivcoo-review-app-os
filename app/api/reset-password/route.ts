// app/api/reset-password/route.ts

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email") as string;

  const supabase = createClient();

  const { error } = await(await supabase).auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/update-password`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Password reset email sent" });
}
