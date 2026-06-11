import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { Product } from "../../types/store";
import { formatMoney, fromUsd } from "../../lib/currency";
import { useStore } from "../../context/StoreContext";

type ProductWithImages = Product & {
  images?: string[];
  shortDescription?: string;
};

export function ProductCard({ product }: { product: Product }) {
  const { t } = useTranslation();
  const { currency, addToCart, toggleWishlist, isWishlisted } = useStore();

  const fullProduct = product as ProductWithImages;

  const storyKey = `products.${product.id}.story` as const;
  const storyText = t(storyKey);
  const price = fromUsd(product.priceUsd, currency);
  const wished = isWishlisted(product.id);

  const galleryImages =
    fullProduct.images && fullProduct.images.length > 0
      ? fullProduct.images.slice(0, 4)
      : [product.image, product.image, product.image, product.image];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/category/${product.category}#${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-[28px] bg-muted">
          {galleryImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={product.name}
              className={`product-card-img product-card-img-${index} absolute inset-0 h-full w-full object-cover`}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "data:image/svg+xml," +
                  encodeURIComponent(
                    `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500"><rect fill="%231e2d4d" width="100%" height="100%"/><text x="50%" y="50%" fill="%23c9a227" font-family="sans-serif" font-size="24" text-anchor="middle">Eagle</text></svg>`,
                  );
              }}
            />
          ))}

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 opacity-70" />

          <span className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm backdrop-blur-md">
            {t(`categories.${product.category}`)}
          </span>

          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-accent shadow-sm backdrop-blur-md transition hover:bg-accent hover:text-white"
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

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
        <div>
          <h3 className="line-clamp-1 font-display text-lg font-bold text-foreground">
            {product.name}
          </h3>

          <p className="mt-1 line-clamp-1 text-sm font-semibold text-muted-foreground">
            {t(`concepts.${product.concept}.title`)}
          </p>
        </div>

        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {fullProduct.shortDescription ??
            (storyText === storyKey
              ? t(`concepts.${product.concept}.desc`)
              : storyText)}
        </p>

        <div className="mt-1 flex items-center justify-between gap-3">
          <span className="font-display text-xl font-bold text-foreground">
            {formatMoney(price, currency)}
          </span>

          <button
            type="button"
            onClick={() => addToCart(product.id)}
            className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-white shadow-md shadow-black/10 transition hover:scale-[1.04] hover:bg-secondary"
          >
            {t("product.add")}
          </button>
        </div>
      </div>
    </article>
  );
}