import Link from "next/link";

export default function Home() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-brand-purple-light) 55%, transparent), transparent 60%), radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--color-brand-purple) 45%, transparent), transparent 55%)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
        <p className="rounded-full border border-primary/30 bg-surface px-4 py-1 text-xs font-medium uppercase tracking-widest text-primary">
          Nigeria&apos;s hair, elevated
        </p>
        <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Beauty, Attitude,{" "}
          <span className="text-primary">Luxe.</span>
        </h1>
        <p className="mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          Premium hair extensions and braided wigs crafted to make life easier
          for the girlies that do it all — one luxe strand at a time.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/shop"
            className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]"
          >
            Shop the collection
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-border bg-surface px-8 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
          >
            Our story
          </Link>
        </div>
      </div>
    </div>
  );
}
