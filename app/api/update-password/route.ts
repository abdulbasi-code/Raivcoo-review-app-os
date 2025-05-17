// app/api/update-password/route.ts

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("password") as string;

  const supabase = createClient();

  const { error } = await(await supabase).auth.updateUser({ password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Password updated successfully" });
}
