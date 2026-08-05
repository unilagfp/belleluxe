import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts, getContentBlocks, getFavoriteProductIds } from "@/lib/supabase/queries";
import { ProductCard } from "@/components/site/ProductCard";
import { getStoragePublicUrl } from "@/lib/supabase/storage";

const HERO_IMAGE_PATH = "a22c9761-1aad-40f9-837a-11e436e704ee/braided-ponytail.jpg";

export default async function Home() {
  const [featured, blocks, favoriteIds] = await Promise.all([
    getFeaturedProducts(4),
    getContentBlocks(),
    getFavoriteProductIds(),
  ]);
  const showAbout = blocks.about_section?.is_visible ?? true;
  const promoBanner = blocks.promo_banner;

  return (
    <div>
      {promoBanner?.is_visible && (
        <div className="bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground">
          {promoBanner.content?.headline || "Limited-time offer — check the shop for details."}
        </div>
      )}

      <section className="relative isolate flex min-h-[560px] items-center overflow-hidden sm:min-h-[640px]">
        <Image
          src={getStoragePublicUrl("product-images", HERO_IMAGE_PATH)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: "50% 15%" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(20,10,25,0.75) 0%, rgba(30,15,35,0.55) 45%, rgba(20,10,25,0.8) 100%)",
          }}
        />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-widest text-white backdrop-blur-sm">
            Nigeria&apos;s hair, elevated
          </p>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Beauty, Attitude, <span className="text-primary">Luxe.</span>
          </h1>
          <p className="mt-5 max-w-xl text-balance text-base text-white/85 sm:text-lg">
            Premium hair extensions and braided wigs crafted to make life easier
            for the girlies that do it all — one luxe strand at a time.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02]"
            >
              Shop the collection
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Our story
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Best sellers
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              Our best-selling collections
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden text-sm font-semibold text-primary hover:underline sm:block"
          >
            View all →
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="text-sm text-muted-foreground">Products coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            {featured.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                initialFavorited={favoriteIds.has(product.id)}
              />
            ))}
          </div>
        )}

        <Link
          href="/shop"
          className="mt-6 block text-center text-sm font-semibold text-primary hover:underline sm:hidden"
        >
          View all →
        </Link>
      </section>

      {showAbout && (
        <section className="border-y border-border bg-surface-muted">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                About BELLÉLUXE
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Beauty should never feel like a chore.
              </h2>
              <p className="mt-4 text-muted-foreground">
                We believe beauty should never feel like a chore. Our premium
                hair extensions and braided wigs are crafted to make life easier
                for the girlies — saving time, serving looks, and boosting
                confidence. For the girlies that do it all, we&apos;re here to
                take the stress out of styling, one luxe strand at a time.
              </p>
              <Link
                href="/about"
                className="mt-6 inline-block rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-semibold hover:bg-background"
              >
                Read our story
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {featured.slice(0, 3).map((product) =>
                product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={product.slug}
                    src={product.imageUrl}
                    alt={product.name}
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                ) : null
              )}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Ready to feel like the main character?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Browse the full collection and find your next signature look.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]"
        >
          Shop now
        </Link>
      </section>
    </div>
  );
}
