import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { ProductCard } from "../../components/product/ProductCard";

export function WishlistPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { user, wishlistProductIds, catalog, checkoutWishlist } = useStore();
  const [msg, setMsg] = useState<string | null>(null);

  const wishlistProducts = useMemo(() => {
    const set = new Set(wishlistProductIds);
    return catalog.filter((p) => set.has(p.id));
  }, [wishlistProductIds, catalog]);

  async function onCheckout() {
    setMsg(null);
    try {
      if (!user) {
        setMsg(t("common.loginRequired"));
        return;
      }
      await checkoutWishlist();
      nav("/history");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("common.error"));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-eagle-foam">
          {t("wishlist.title")}
        </h1>
        <p className="text-sm text-eagle-sand/70">
          {wishlistProducts.length} · {t("wishlist.items")}
        </p>
      </div>

      {wishlistProducts.length === 0 ? (
        <p className="mt-6 text-eagle-sand/80">{t("wishlist.empty")}</p>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-eagle-mist/40 bg-eagle-deep/60 p-6">
            <p className="text-xs text-eagle-sand/60">{t("wishlist.ctaHelp")}</p>
            {msg ? <p className="mt-3 text-sm text-eagle-red">{msg}</p> : null}
            {!user && msg ? (
              <button
                type="button"
                onClick={() => nav("/login?mode=login")}
                className="mt-3 w-full rounded-2xl bg-eagle-red py-3 text-sm font-bold text-eagle-foam transition hover:bg-eagle-gold"
              >
                {t("nav.login")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void onCheckout()}
              className="mt-4 w-full rounded-2xl bg-eagle-red py-3 text-sm font-bold text-eagle-foam transition hover:bg-eagle-gold"
            >
              {t("wishlist.buy")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

