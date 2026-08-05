import { Mail, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ContactForm } from "./ContactForm";

export const metadata = { title: "Contact" };

type SocialLinks = {
  instagram?: string;
  tiktok?: string;
  whatsapp_number?: string;
  contact_email?: string;
};

export default async function ContactPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "social_links")
    .single();

  const social = (data?.value as SocialLinks) ?? {};

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-bold">Get in touch</h1>
        <p className="mt-3 text-muted-foreground">
          Questions about an order, or want something custom? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4">
          {social.contact_email && (
            <a
              href={`mailto:${social.contact_email}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:bg-surface-muted"
            >
              <Mail size={18} className="text-primary" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{social.contact_email}</p>
              </div>
            </a>
          )}
          {social.whatsapp_number && (
            <a
              href={`https://wa.me/${social.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 hover:bg-surface-muted"
            >
              <MessageCircle size={18} className="text-primary" />
              <div>
                <p className="text-sm font-medium">WhatsApp</p>
                <p className="text-sm text-muted-foreground">Chat with us directly</p>
              </div>
            </a>
          )}
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
