import Link from "next/link";

export const metadata = { title: "About" };

const VALUES = [
  {
    title: "Premium quality",
    body: "Every bundle and braided piece is chosen for texture, density, and how it holds up in real, everyday wear.",
  },
  {
    title: "Time-saving",
    body: "Ready-to-wear pieces mean less time in the chair and more time living — install, style, go.",
  },
  {
    title: "Confidence first",
    body: "We believe great hair is a mood. Everything we sell is picked to make you feel like the main character.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <div className="border-b border-border bg-surface-muted px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Our story
        </p>
        <h1 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-bold sm:text-5xl">
          Beauty should never feel like a chore.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-muted-foreground">
          BELLÉLUXE started with a simple idea: premium hair extensions and
          braided wigs that make life easier for the girlies who do it all —
          saving time, serving looks, and boosting confidence, one luxe
          strand at a time.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-16 sm:grid-cols-3 sm:px-6">
        {VALUES.map((value) => (
          <div key={value.title} className="rounded-xl border border-border bg-surface p-6">
            <h2 className="font-display text-lg font-bold">{value.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{value.body}</p>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-20 text-center sm:px-6">
        <p className="font-display text-2xl font-semibold">
          Beauty, Attitude, <span className="text-primary">Luxe.</span>
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]"
        >
          Shop the collection
        </Link>
      </div>
    </div>
  );
}
