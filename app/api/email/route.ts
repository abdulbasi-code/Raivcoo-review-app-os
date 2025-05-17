// app/api/email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";

const resend = new Resend(process.env.RESEND_API_KEY!);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { data: users, error } = await supabase
      .from("editor_profiles")
      .select("email, display_name")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      throw new Error(`Failed to fetch user data: ${error.message}`);
    }

    const lastUser = users && users.length > 0 ? users[0] : null;

    // Get the current date and time
    const currentDate = format(new Date(), "MMMM d, yyyy");
    const currentTime = format(new Date(), "h:mm a");

    // Prepare the email content
    const emailData = {
      from: "no-reply@TEST.com",
      to: "TEST@gmail.com",
      subject: "New User Signup Notification 👋",
      html: `
        <h1>New User Signup 📑</h1>
        <p>A new user has signed up on TEST.com 🪄.</p>
        ${
          lastUser
            ? `
              <p>User Details:</p>
              <ul>
                <li>Email: ${lastUser.email}</li>
                <li>Display Name: ${lastUser.display_name}</li>
              </ul>
            `
            : ""
        }
        <p>Date: ${currentDate}</p>
      
      `,
    };

    // Send the email using Resend
    await resend.emails.send(emailData);

    return NextResponse.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
