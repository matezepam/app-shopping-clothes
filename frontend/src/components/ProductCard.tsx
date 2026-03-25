import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Product } from "../types/store";
import { formatMoney, fromUsd } from "../lib/currency";
import { useStore } from "../context/StoreContext";

export function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const { currency, addToCart, toggleWishlist, isWishlisted } = useStore();
  const storyKey = `products.${product.id}.story` as const;
  const storyText = t(storyKey);
  const price = fromUsd(product.priceUsd, currency);
  const wished = isWishlisted(product.id);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-eagle-mist/40 bg-eagle-deep/60 shadow-lg shadow-black/20 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-eagle-red/55 hover:shadow-eagle-red/20">
      <Link to={`/category/${product.category}#${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-eagle-mist/30">
          <img
            src={product.image}
            alt=""
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml," +
                encodeURIComponent(
                  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect fill="%231e2d4d" width="100%" height="100%"/><text x="50%" y="50%" fill="%23c9a227" font-family="sans-serif" font-size="18" text-anchor="middle">Eagle</text></svg>`,
                );
            }}
          />
          <span className="absolute left-3 top-3 rounded-full bg-eagle-night/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-eagle-gold ring-1 ring-eagle-gold/30">
            {t(`categories.${product.category}`)}
          </span>
          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-eagle-night/80 text-eagle-sand/90 ring-1 ring-eagle-mist/40 transition hover:bg-eagle-night hover:text-eagle-foam"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={wished ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-eagle-foam">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-eagle-sand/80">
            {t(`concepts.${product.concept}.title`)}
          </p>
        </div>
        <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-eagle-sand/90">
          {storyText === storyKey ? t(`concepts.${product.concept}.desc`) : storyText}
        </p>
        <div className="flex items-center justify-between gap-2 border-t border-eagle-mist/30 pt-3">
          <span className="font-display text-xl font-bold text-eagle-gold">
            {formatMoney(price, currency)}
          </span>
          <button
            type="button"
            onClick={() => addToCart(product.id)}
            className="rounded-xl bg-eagle-red px-4 py-2 text-sm font-semibold text-eagle-foam transition hover:scale-[1.03] hover:bg-eagle-gold hover:text-eagle-night"
          >
            {t("product.add")}
          </button>
        </div>
      </div>
    </article>
  );
}
