// app/api/verify-pro/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Create supabase client with cookies
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { order, planId, planName } = body;

    // Validate order data
    if (!order?.id || order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Invalid or incomplete order" },
        { status: 400 }
      );
    }

    // Get purchase amount from order
    const purchaseUnit = order.purchase_units?.[0];
    const amount = parseFloat(purchaseUnit?.amount?.value || "0");
    const currency = purchaseUnit?.amount?.currency_code || "USD";

    // Get editor profile
    const { data: profile, error: profileError } = await supabase
      .from("editor_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Set expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Save subscription record
    const { error: insertError } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      profile_id: profile.id,
      paypal_order_id: order.id,
      payment_status: order.status,
      amount: amount,
      currency: currency,
      plan_id: planId,
      plan_name: planName,
      expires_at: expiresAt.toISOString(),
    });

    if (insertError) {
      console.error("Insert Error:", insertError);
      return NextResponse.json(
        { error: "Failed to record subscription" },
        { status: 500 }
      );
    }

    // Update only the verification status in editor_profiles
    const { error: updateError } = await supabase
      .from("editor_profiles")
      .update({
        is_verified: true,
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Update Error:", updateError);
      // Continue anyway since the subscription was recorded
    }

    return NextResponse.json({
      message: "Subscription activated successfully",
      plan: planId,
      expires: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Server error:", error);
    // Make sure to always return a response, even in the catch block
    return NextResponse.json(
      { error: "Server error processing subscription" },
      { status: 500 }
    );
  }
}
