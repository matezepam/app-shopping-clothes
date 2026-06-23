import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { categorySections, concepts } from "../../data/products";
import { useStore } from "../../context/StoreContext";
import { formatMoney, fromUsd } from "../../lib/currency";

const productShowcase = [
  {
    name: "Urban Concept Jacket",
    concept: "Oversized · Streetwear · Premium fit",
    price: "$48.99",
    category: "souvenirs",
    productId: undefined,
    images: [
      "/images/products/hoodie.svg",
      "/images/products/tee.svg",
      "/images/products/cap.svg",
    ],
  },
  {
    name: "Andes Graphic Tee",
    concept: "Cotton · Minimal print · Daily outfit",
    price: "$24.99",
    category: "souvenirs",
    productId: undefined,
    images: [
      "/images/products/tee.svg",
      "/images/products/canvas.svg",
      "/images/products/poster.svg",
    ],
  },
  {
    name: "Galápagos Tech Hoodie",
    concept: "Soft fleece · Relaxed · Modern culture",
    price: "$39.99",
    category: "souvenirs",
    productId: undefined,
    images: [
      "/images/products/hoodie.svg",
      "/images/products/souvenir.svg",
      "/images/products/cap.svg",
    ],
  },
];

const outfitCards = [
  {
    id: "street",
    href: "/category/men",
    image: "/images/products/tee.svg",
  },
  {
    id: "clean",
    href: "/category/women",
    image: "/images/products/hoodie.svg",
  },
  {
    id: "premium",
    href: "/category/souvenirs",
    image: "/images/products/souvenir.svg",
  },
];

const conceptImages = [
  [
    "/images/concepts/galapagos.svg",
    "/images/hero/galapagos.svg",
    "/images/products/tee.svg",
  ],
  [
    "/images/concepts/andes.svg",
    "/images/hero/andes.svg",
    "/images/products/hoodie.svg",
  ],
  [
    "/images/concepts/quito.svg",
    "/images/hero/quito.svg",
    "/images/products/poster.svg",
  ],
];

const seasonCards = [
  {
    id: "summer",
    href: "/category/women",
    image: "/images/hero/galapagos.svg",
  },
  {
    id: "urban",
    href: "/category/men",
    image: "/images/products/hoodie.svg",
  },
  {
    id: "travel",
    href: "/category/souvenirs",
    image: "/images/products/souvenir.svg",
  },
];

export function HomePage() {
  const { t } = useTranslation();
  const { catalog, currency } = useStore();
  const [activeAngle, setActiveAngle] = useState(0);
  const [activeProduct, setActiveProduct] = useState(0);
  const [activeConceptImage, setActiveConceptImage] = useState(0);

  const showcaseProducts = useMemo(() => {
    if (catalog.length === 0) return productShowcase;

    return catalog.slice(0, 3).map((product) => ({
      name: product.name,
      concept: product.description ?? t(`concepts.${product.concept}.title`),
      price: formatMoney(fromUsd(product.priceUsd, currency), currency),
      category: product.collection ?? product.category,
      productId: product.id,
      images: product.images?.length ? product.images : [product.image],
    }));
  }, [catalog, currency, t]);

  const currentProduct = useMemo(
    () => showcaseProducts[activeProduct % showcaseProducts.length],
    [activeProduct, showcaseProducts]
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveAngle((prev) => (prev + 1) % currentProduct.images.length);
    }, 2300);

    return () => window.clearInterval(id);
  }, [currentProduct.images.length]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveProduct((prev) => (prev + 1) % showcaseProducts.length);
      setActiveAngle(0);
    }, 6900);

    return () => window.clearInterval(id);
  }, [showcaseProducts.length]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveConceptImage((prev) => (prev + 1) % 3);
    }, 2600);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-20 overflow-x-clip">
      <style>
        {`
          @keyframes floatFashion {
            0%, 100% { transform: translate3d(0, 0, 0) rotate(-1.5deg); }
            50% { transform: translate3d(0, -12px, 0) rotate(1.5deg); }
          }

          @keyframes pulseLine {
            0%, 100% { opacity: .25; transform: scaleX(.8); }
            50% { opacity: 1; transform: scaleX(1); }
          }

          @keyframes softGlow {
            0%, 100% { opacity: .45; transform: scale(.95); }
            50% { opacity: .9; transform: scale(1.05); }
          }

          @keyframes heroImageIn {
            from { opacity: 0; transform: scale(1.06) translateY(8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }

          @keyframes slideShine {
            0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
            35% { opacity: .7; }
            100% { transform: translateX(160%) skewX(-18deg); opacity: 0; }
          }

          .fashion-float {
            animation: floatFashion 4s ease-in-out infinite;
            will-change: transform;
          }

          .tech-line {
            animation: pulseLine 2.4s ease-in-out infinite;
          }

          .soft-glow {
            animation: softGlow 4s ease-in-out infinite;
          }

          .hero-image-active {
            animation: heroImageIn .7s ease both;
          }

          .season-shine::after {
            animation: slideShine 4.8s ease-in-out infinite;
          }
        `}
      </style>

      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#090909] text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,0,80,.25),transparent_30%)]" />
        <div className="absolute left-8 top-8 h-24 w-24 rounded-full border border-white/10" />
        <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full border border-white/10" />

        <div className="relative grid min-h-[640px] gap-10 px-7 py-12 md:grid-cols-2 md:px-14 lg:px-20">
          <div className="flex flex-col justify-center">
            <p className="w-fit rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-white/80 backdrop-blur">
              {t("home.hero.badge")}
            </p>

            <h1 className="mt-7 font-display text-5xl font-black leading-[0.95] md:text-7xl">
              {t("home.hero.title")}
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
              {t("home.hero.subtitle")}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to={`/category/${currentProduct.category}`}
                className="rounded-full bg-white px-8 py-4 text-sm font-black text-black transition hover:-translate-y-1 hover:bg-accent hover:text-white"
              >
                {t("home.hero.shop")}
              </Link>

              <a
                href="#outfits"
                className="rounded-full border border-white/20 px-8 py-4 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-white hover:text-black"
              >
                {t("home.hero.outfits")}
              </a>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-2xl font-black">360°</p>
                <p className="mt-1 text-xs text-white/50">{t("home.hero.statAngles")}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-2xl font-black">FIT</p>
                <p className="mt-1 text-xs text-white/50">{t("home.hero.statFit")}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-2xl font-black">EC</p>
                <p className="mt-1 text-xs text-white/50">{t("home.hero.statLocal")}</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute left-0 top-12 hidden w-36 rounded-[2rem] border border-white/10 bg-white/10 p-3 backdrop-blur md:block fashion-float">
              <img
                src={productShowcase[1].images[0]}
                alt=""
                className="h-44 w-full rounded-[1.5rem] object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/hero/galapagos.svg";
                }}
              />
              <p className="mt-3 text-center text-xs font-bold text-white/80">
                {t("home.hero.sideLook")}
              </p>
            </div>

            <div className="relative z-10 w-full max-w-[390px] rounded-[2.5rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
              <div className="relative overflow-hidden rounded-[2rem] bg-[#f4f4f4]">
                {currentProduct.images.map((img, idx) => (
                  <img
                    key={img}
                    src={img}
                    alt={currentProduct.name}
                    className={`h-[430px] w-full object-cover transition-all duration-700 ${
                      idx === activeAngle
                        ? "hero-image-active scale-100 opacity-100"
                        : "absolute inset-0 scale-105 opacity-0"
                    }`}
                    onError={(e) => {
                      e.currentTarget.src = "/images/hero/galapagos.svg";
                    }}
                  />
                ))}

                <div className="absolute left-4 top-4 rounded-full bg-black px-4 py-2 text-xs font-black text-white">
                  {t("home.hero.autoAngle")}
                </div>
              </div>

              <div className="mt-5 rounded-[1.7rem] bg-white p-5 text-black">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">
                  {t("home.hero.featured")}
                </p>
                <h3 className="mt-2 font-display text-2xl font-black">
                  {currentProduct.name}
                </h3>
                <p className="mt-2 text-sm font-semibold text-neutral-500">
                  {currentProduct.concept}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <p className="text-3xl font-black">{currentProduct.price}</p>
                  <Link
                    to={currentProduct.productId ? `/products/${currentProduct.productId}` : `/category/${currentProduct.category}`}
                    className="rounded-full bg-black px-5 py-3 text-xs font-black text-white transition hover:bg-accent"
                  >
                    {t("home.hero.viewProduct")}
                  </Link>
                </div>
              </div>
            </div>

            <div className="absolute bottom-12 right-0 hidden w-44 rounded-[2rem] border border-white/10 bg-white/10 p-3 backdrop-blur md:block fashion-float">
              <img
                src={productShowcase[2].images[1]}
                alt=""
                className="h-28 w-full rounded-[1.5rem] object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/hero/andes.svg";
                }}
              />
              <p className="mt-3 text-center text-xs font-bold text-white/80">
                {t("home.hero.conceptDrop")}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
          {showcaseProducts.map((product, idx) => (
            <button
              key={`${product.name}-${idx}`}
              type="button"
              onClick={() => {
                setActiveProduct(idx);
                setActiveAngle(0);
              }}
              className={`h-2 rounded-full transition-all ${
                idx === activeProduct ? "w-12 bg-white" : "w-3 bg-white/35"
              }`}
              aria-label={t("home.hero.goToProduct", { number: idx + 1 })}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-accent">
              {t("home.categories.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-4xl font-black text-foreground">
              {t("home.categories.title")}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {t("home.categories.text")}
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {categorySections.map((s, idx) => (
            <Link
              key={s.id}
              to={`/category/${s.id}`}
              className={`group relative overflow-hidden rounded-[2rem] border border-black/10 bg-white p-6 shadow-lg shadow-black/5 transition hover:-translate-y-2 hover:shadow-2xl ${
                idx === 1 ? "sm:translate-y-8" : ""
              }`}
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent/10 transition group-hover:scale-150" />
              <p className="relative text-xs font-black uppercase tracking-[0.2em] text-accent">
                {t("home.categories.collection", { number: idx + 1 })}
              </p>
              <h3 className="relative mt-4 font-display text-2xl font-black text-foreground group-hover:text-accent">
                {t(`categories.${s.id}`)}
              </h3>
              <p className="relative mt-3 text-sm font-semibold leading-relaxed text-muted-foreground">
                {s.categories.map((c) => t(`categories.${c}`)).join(" · ")}
              </p>
              <p className="relative mt-8 text-sm font-black text-foreground">
                {t("home.categories.explore")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-accent">
              {t("home.season.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-4xl font-black text-foreground">
              {t("home.season.title")}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            {t("home.season.text")}
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {seasonCards.map((card) => (
            <Link
              key={card.id}
              to={card.href}
              className="season-shine group relative min-h-[280px] overflow-hidden rounded-[2rem] bg-neutral-950 p-6 text-white shadow-xl shadow-black/10 transition duration-500 hover:-translate-y-2"
            >
              <img
                src={card.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-white/20 opacity-0 season-shine after:absolute after:inset-y-0 after:left-0 after:w-1/3 after:bg-white/35" />
              <div className="relative flex h-full min-h-[230px] flex-col justify-end">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/65">
                  {t(`home.season.cards.${card.id}.eyebrow`)}
                </p>
                <h3 className="mt-3 font-display text-3xl font-black">
                  {t(`home.season.cards.${card.id}.title`)}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  {t(`home.season.cards.${card.id}.text`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="outfits"
        className="rounded-[2.5rem] bg-neutral-950 p-7 text-white md:p-12"
      >
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.4fr] md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-white/50">
              {t("home.outfits.eyebrow")}
            </p>
            <h2 className="mt-3 font-display text-4xl font-black">
              {t("home.outfits.title")}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              {t("home.outfits.text")}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {outfitCards.map((item, idx) => (
              <Link
                to={item.href}
                key={item.id}
                className={`group overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-3 backdrop-blur transition hover:-translate-y-2 ${
                  idx === 1 ? "sm:-translate-y-8" : ""
                }`}
              >
                <div className="relative overflow-hidden rounded-[1.5rem] bg-white">
                  <img
                    src={item.image}
                    alt={t(`home.outfits.cards.${item.id}.title`)}
                    className="h-72 w-full object-cover transition duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "/images/hero/quito.svg";
                    }}
                  />
                  <div className="absolute inset-x-4 bottom-4 h-1 origin-left rounded-full bg-white/70 tech-line" />
                </div>
                <div className="p-3">
                  <h3 className="font-display text-lg font-black">
                    {t(`home.outfits.cards.${item.id}.title`)}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">
                    {t(`home.outfits.cards.${item.id}.text`)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="concepts" className="relative">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl soft-glow" />
        <div className="absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-black/10 blur-3xl soft-glow" />

        <div className="relative text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-accent">
            {t("home.concepts.eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-4xl font-black text-foreground md:text-5xl">
            {t("home.concepts.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t("home.concepts.text")}
          </p>
        </div>

        <div className="relative mt-12 space-y-10">
          {concepts.map((c, idx) => {
            const reverse = idx % 2 !== 0;
            const images = conceptImages[idx % conceptImages.length];

            return (
              <article
                key={c.id}
                className={`group grid overflow-hidden rounded-[2.5rem] border border-black/10 bg-white shadow-2xl shadow-black/5 transition duration-500 hover:-translate-y-2 md:grid-cols-2 ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="relative min-h-[360px] overflow-hidden bg-neutral-950">
                  {images.map((img, imageIdx) => (
                    <img
                      key={img}
                      src={img}
                      alt={t(`concepts.${c.id}.title`)}
                      className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ${
                        imageIdx === activeConceptImage
                          ? "scale-100 opacity-100"
                          : "scale-110 opacity-0"
                      }`}
                      onError={(e) => {
                        e.currentTarget.src = c.image;
                      }}
                    />
                  ))}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur">
                    {t("home.concepts.conceptNumber", { number: idx + 1 })}
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-white/70">
                      {t("home.concepts.visualStory")}
                    </p>
                    <div className="flex gap-2">
                      {images.map((_, imageIdx) => (
                        <div
                          key={imageIdx}
                          className={`h-1.5 rounded-full transition-all ${
                            imageIdx === activeConceptImage
                              ? "w-12 bg-white"
                              : "w-5 bg-white/35"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative flex flex-col justify-center overflow-hidden p-8 md:p-12">
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/10 transition duration-500 group-hover:scale-150" />
                  <div className="absolute -bottom-16 left-10 h-32 w-32 rounded-full border border-black/10" />

                  <p className="relative text-xs font-black uppercase tracking-[0.25em] text-accent">
                    {t("home.concepts.editorial")}
                  </p>

                  <h3 className="relative mt-4 font-display text-3xl font-black leading-tight text-foreground md:text-4xl">
                    {t(`concepts.${c.id}.title`)}
                  </h3>

                  <p className="relative mt-5 text-sm leading-relaxed text-muted-foreground">
                    {t(`concepts.${c.id}.desc`)}
                  </p>

                  <div className="relative mt-8 grid grid-cols-3 gap-3">
                    {images.map((img, imageIdx) => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => setActiveConceptImage(imageIdx)}
                        className={`overflow-hidden rounded-2xl border bg-neutral-100 transition hover:-translate-y-1 ${
                          imageIdx === activeConceptImage
                            ? "border-accent ring-2 ring-accent/20"
                            : "border-black/10"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          className="h-24 w-full object-cover transition duration-500 hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = c.image;
                          }}
                        />
                      </button>
                    ))}
                  </div>

                  <div className="relative mt-8 flex flex-wrap gap-3">
                    <Link
                      to="/category/men"
                      className="rounded-full bg-black px-5 py-3 text-xs font-black text-white transition hover:bg-accent"
                    >
                      {t("home.concepts.tags.outfit")}
                    </Link>
                    <Link
                      to="/category/souvenirs"
                      className="rounded-full border border-black/10 px-5 py-3 text-xs font-black text-foreground transition hover:border-accent hover:text-accent"
                    >
                      {t("home.concepts.tags.design")}
                    </Link>
                    <Link
                      to="/category/women"
                      className="rounded-full border border-black/10 px-5 py-3 text-xs font-black text-foreground transition hover:border-accent hover:text-accent"
                    >
                      {t("home.concepts.tags.visual")}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
