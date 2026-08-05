import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email } = (await request.json()) ?? {};

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
