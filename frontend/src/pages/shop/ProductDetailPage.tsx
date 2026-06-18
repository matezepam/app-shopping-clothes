import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { Heart, Minus, Plus, ShoppingBag, ZoomIn } from "lucide-react";
import { api } from "../../lib/api";
import { formatMoney, fromUsd } from "../../lib/currency";
import { useStore } from "../../context/StoreContext";
import type { Product } from "../../types/store";

export function ProductDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const {
    catalog,
    currency,
    addToCart,
    toggleWishlist,
    isWishlisted,
  } = useStore();
  const [product, setProduct] = useState<Product | null>(
    catalog.find((item) => item.id === id) ?? null,
  );
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const found = catalog.find((item) => item.id === id);
    if (found) {
      setProduct(found);
      return;
    }

    setLoading(true);
    api
      .product(id)
      .then(({ product: nextProduct }) => setProduct(nextProduct))
      .finally(() => setLoading(false));
  }, [catalog, id]);

  const images = useMemo(() => {
    if (!product) return [];
    return product.images?.length ? product.images : [product.image];
  }, [product]);

  if (loading && !product) {
    return (
      <section className="grid min-h-[55vh] place-items-center">
        <p className="text-sm font-bold text-neutral-500">{t("common.loading")}</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-black text-neutral-950">
          {t("productDetail.notFound")}
        </h1>
        <Link
          to="/"
          className="mt-6 rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-neutral-950"
        >
          {t("productDetail.back")}
        </Link>
      </section>
    );
  }

  const wished = isWishlisted(product.id);
  const price = formatMoney(fromUsd(product.priceUsd, currency), currency);
  const compareAt = product.compareAtPriceUsd
    ? formatMoney(fromUsd(product.compareAtPriceUsd, currency), currency)
    : null;

  return (
    <section className="animate-fade-up space-y-8">
      <Link
        to={`/category/${product.collection ?? product.category}`}
        className="inline-flex text-sm font-bold text-neutral-500 transition hover:text-neutral-950"
      >
        {t("productDetail.back")}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-4 lg:grid-cols-[96px_1fr]">
          <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveImage(index)}
                className={[
                  "h-24 w-24 shrink-0 overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5",
                  activeImage === index
                    ? "border-neutral-950 ring-2 ring-neutral-950/10"
                    : "border-neutral-200",
                ].join(" ")}
              >
                <img
                  src={image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="group relative order-1 aspect-square overflow-hidden rounded-[2rem] bg-neutral-100 shadow-xl shadow-black/10 lg:order-2">
            <img
              src={images[activeImage] ?? product.image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-125"
            />
            <div className="pointer-events-none absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-black text-neutral-950 shadow-sm backdrop-blur">
              <ZoomIn size={15} />
              {t("productDetail.zoom")}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-accent">
            {t(`categories.${product.collection ?? product.category}`)}
          </p>

          <h1 className="mt-3 font-display text-4xl font-black leading-tight text-neutral-950 md:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 text-sm leading-7 text-neutral-500">
            {product.description ?? t(`concepts.${product.concept}.desc`)}
          </p>

          <div className="mt-6 flex items-end gap-3">
            <p className="font-display text-4xl font-black text-neutral-950">
              {price}
            </p>
            {compareAt ? (
              <p className="pb-1 text-lg font-bold text-neutral-400 line-through">
                {compareAt}
              </p>
            ) : null}
          </div>

          <div className="mt-7 grid gap-5">
            {product.sizes?.length ? (
              <section>
                <p className="mb-3 text-sm font-black text-neutral-950">
                  {t("productDetail.size")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={[
                        "min-w-12 rounded-2xl border px-4 py-3 text-sm font-black transition",
                        selectedSize === size
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-950",
                      ].join(" ")}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <p className="mb-3 text-sm font-black text-neutral-950">
                {t("productDetail.color")}
              </p>
              <span className="inline-flex rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-700">
                {t(`shop.colors.${product.color}`, product.color)}
              </span>
            </section>

            <section>
              <p className="mb-3 text-sm font-black text-neutral-950">
                {t("productDetail.quantity")}
              </p>
              <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQty((current) => Math.max(1, current - 1))}
                  className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-neutral-100"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center text-sm font-black">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((current) => current + 1)}
                  className="grid h-10 w-10 place-items-center rounded-full transition hover:bg-neutral-100"
                >
                  <Plus size={16} />
                </button>
              </div>
            </section>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => addToCart(product.id, qty)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-4 text-sm font-black text-white transition hover:bg-primary hover:text-neutral-950"
            >
              <ShoppingBag size={18} />
              {t("product.add")}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-6 py-4 text-sm font-black text-neutral-700 transition hover:bg-neutral-100"
            >
              <Heart size={18} fill={wished ? "currentColor" : "none"} />
              {wished ? t("productDetail.saved") : t("productDetail.save")}
            </button>
          </div>
        </div>
      </div>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-7 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-accent">
          {t("product.story")}
        </p>
        <p className="mt-4 max-w-3xl text-base leading-8 text-neutral-600">
          {product.story ?? t(`products.${product.id}.story`, t(`concepts.${product.concept}.desc`))}
        </p>
      </section>
    </section>
  );
}
