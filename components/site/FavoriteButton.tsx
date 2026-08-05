"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

export function FavoriteButton({
  productId,
  initialFavorited,
  className,
}: {
  productId: string;
  initialFavorited: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (favorited) {
      setFavorited(false);
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
      if (error) setFavorited(true);
    } else {
      setFavorited(true);
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, product_id: productId });
      if (error) setFavorited(false);
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorited}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-transform hover:scale-110 dark:bg-black/60",
        className
      )}
    >
      <Heart
        size={15}
        className={favorited ? "fill-primary text-primary" : "text-foreground"}
      />
    </button>
  );
}
