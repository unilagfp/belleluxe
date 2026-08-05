import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendBroadcast } from "@/lib/email/brevo";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const { subject, message } = (await request.json()) ?? {};
  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required." }, { status: 400 });
  }

  const { data: subscribers } = await supabase
    .from("newsletter_subscribers")
    .select("email")
    .eq("is_active", true);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ error: "No active subscribers to send to." }, { status: 400 });
  }

  try {
    const result = await sendBroadcast(
      subscribers.map((s) => s.email),
      subject,
      message
    );

    await supabase.from("email_log").insert(
      subscribers.map((s) => ({
        type: "newsletter_broadcast" as const,
        recipient: s.email,
        subject,
        brevo_message_id: result.messageId ?? null,
        status: "sent",
      }))
    );

    return NextResponse.json({ success: true, sentTo: subscribers.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send broadcast." },
      { status: 502 }
    );
  }
}
