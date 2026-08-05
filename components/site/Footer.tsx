import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-brand-ink text-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-xl font-bold text-primary">BELLÉLUXE</p>
            <p className="mt-2 max-w-xs text-sm text-white/70">
              Beauty, Attitude, Luxe. Premium hair extensions and braided wigs
              crafted to make life easier for the girlies.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
              Shop
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>
                <Link href="/shop" className="hover:text-primary">
                  All products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
              Get in touch
            </p>
            <ul className="mt-3 space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <Mail size={15} />
                <span>gift001raphael@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle size={15} />
                <span>WhatsApp: 08141620382</span>
              </li>
              <li className="flex items-center gap-2">
                <InstagramIcon />
                <span>@getpretty_w_gift_raphael</span>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} BELLÉLUXE. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
