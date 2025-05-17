import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Insert download record
  const { error } = await supabase.from("extension_downloads").insert({
    user_id: user.id,
    email: user.email,
    extension_type: "TEST-all-adobe",
    downloaded_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json(
      { error: "Failed to track download" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
