import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { categorySections, concepts } from "../../data/products";

const productShowcase = [
  {
    name: "Urban Concept Jacket",
    concept: "Oversized · Streetwear · Premium fit",
    price: "$48.99",
    category: "souvenirs",
    images: [
      "/images/products/jacket-front.png",
      "/images/products/jacket-side.png",
      "/images/products/jacket-back.png",
    ],
  },
  {
    name: "Andes Graphic Tee",
    concept: "Cotton · Minimal print · Daily outfit",
    price: "$24.99",
    category: "souvenirs",
    images: [
      "/images/products/tshirt-front.png",
      "/images/products/tshirt-side.png",
      "/images/products/tshirt-back.png",
    ],
  },
  {
    name: "Galápagos Tech Hoodie",
    concept: "Soft fleece · Relaxed · Modern culture",
    price: "$39.99",
    category: "souvenirs",
    images: [
      "/images/products/hoodie-front.png",
      "/images/products/hoodie-side.png",
      "/images/products/hoodie-back.png",
    ],
  },
];

const outfitCards = [
  {
    title: "Street Essential",
    desc: "Camiseta gráfica, jean recto y chaqueta ligera para un look urbano.",
    image: "/images/outfits/outfit-1.png",
  },
  {
    title: "Clean Modern Fit",
    desc: "Prendas neutras, minimalistas y combinables para cualquier ocasión.",
    image: "/images/outfits/outfit-2.png",
  },
  {
    title: "Premium Concept",
    desc: "Diseño inspirado en identidad, cultura y moda contemporánea.",
    image: "/images/outfits/outfit-3.png",
  },
];

const conceptImages = [
  [
    "/images/concepts/galapagos-1.png",
    "/images/concepts/galapagos-2.png",
    "/images/concepts/galapagos-3.png",
  ],
  [
    "/images/concepts/andes-1.png",
    "/images/concepts/andes-2.png",
    "/images/concepts/andes-3.png",
  ],
  [
    "/images/concepts/quito-1.png",
    "/images/concepts/quito-2.png",
    "/images/concepts/quito-3.png",
  ],
];

export function HomePage() {
  const { t } = useTranslation();
  const [activeAngle, setActiveAngle] = useState(0);
  const [activeProduct, setActiveProduct] = useState(0);
  const [activeConceptImage, setActiveConceptImage] = useState(0);

  const currentProduct = useMemo(
    () => productShowcase[activeProduct],
    [activeProduct]
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveAngle((prev) => (prev + 1) % currentProduct.images.length);
    }, 2300);

    return () => window.clearInterval(id);
  }, [currentProduct.images.length]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveProduct((prev) => (prev + 1) % productShowcase.length);
      setActiveAngle(0);
    }, 6900);

    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveConceptImage((prev) => (prev + 1) % 3);
    }, 2600);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-20 overflow-hidden">
      <style>
        {`
          @keyframes floatFashion {
            0%, 100% { transform: translateY(0px) rotate(-2deg); }
            50% { transform: translateY(-14px) rotate(2deg); }
          }

          @keyframes pulseLine {
            0%, 100% { opacity: .25; transform: scaleX(.8); }
            50% { opacity: 1; transform: scaleX(1); }
          }

          @keyframes softGlow {
            0%, 100% { opacity: .45; transform: scale(.95); }
            50% { opacity: .9; transform: scale(1.05); }
          }

          .fashion-float {
            animation: floatFashion 4s ease-in-out infinite;
          }

          .tech-line {
            animation: pulseLine 2.4s ease-in-out infinite;
          }

          .soft-glow {
            animation: softGlow 4s ease-in-out infinite;
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
              Nueva colección
            </p>

            <h1 className="mt-7 font-display text-5xl font-black leading-[0.95] md:text-7xl">
              Moda con concepto, estilo y actitud.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
              Explora outfits modernos, prendas con identidad visual y productos
              presentados desde diferentes ángulos para una experiencia más
              premium y tecnológica.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to={`/category/${currentProduct.category}`}
                className="rounded-full bg-white px-8 py-4 text-sm font-black text-black transition hover:-translate-y-1 hover:bg-accent hover:text-white"
              >
                Comprar colección
              </Link>

              <a
                href="#outfits"
                className="rounded-full border border-white/20 px-8 py-4 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-white hover:text-black"
              >
                Ver outfits
              </a>
            </div>

            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-2xl font-black">360°</p>
                <p className="mt-1 text-xs text-white/50">Ángulos visuales</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-2xl font-black">FIT</p>
                <p className="mt-1 text-xs text-white/50">Outfits modernos</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-2xl font-black">EC</p>
                <p className="mt-1 text-xs text-white/50">Concepto local</p>
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
                Side Look
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
                        ? "scale-100 opacity-100"
                        : "absolute inset-0 scale-105 opacity-0"
                    }`}
                    onError={(e) => {
                      e.currentTarget.src = "/images/hero/galapagos.svg";
                    }}
                  />
                ))}

                <div className="absolute left-4 top-4 rounded-full bg-black px-4 py-2 text-xs font-black text-white">
                  AUTO ANGLE
                </div>
              </div>

              <div className="mt-5 rounded-[1.7rem] bg-white p-5 text-black">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">
                  Producto destacado
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
                    to={`/category/${currentProduct.category}`}
                    className="rounded-full bg-black px-5 py-3 text-xs font-black text-white transition hover:bg-accent"
                  >
                    Ver producto
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
                Concept Drop
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
          {productShowcase.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveProduct(idx);
                setActiveAngle(0);
              }}
              className={`h-2 rounded-full transition-all ${
                idx === activeProduct ? "w-12 bg-white" : "w-3 bg-white/35"
              }`}
              aria-label={`Producto ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-accent">
              Explora la tienda
            </p>
            <h2 className="mt-3 font-display text-4xl font-black text-foreground">
              Categorías modernas
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Secciones pensadas para mostrar prendas, colecciones, accesorios y
            conceptos visuales sin ocupar demasiado espacio.
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
                Colección 0{idx + 1}
              </p>
              <h3 className="relative mt-4 font-display text-2xl font-black text-foreground group-hover:text-accent">
                {t(`categories.${s.id}`)}
              </h3>
              <p className="relative mt-3 text-sm font-semibold leading-relaxed text-muted-foreground">
                {s.categories.map((c) => t(`categories.${c}`)).join(" · ")}
              </p>
              <p className="relative mt-8 text-sm font-black text-foreground">
                Explorar →
              </p>
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
              Outfit lab
            </p>
            <h2 className="mt-3 font-display text-4xl font-black">
              Looks completos, no solo productos.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Muestra combinaciones reales de ropa para que el cliente visualice
              cómo se ve cada prenda dentro de un outfit moderno.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {outfitCards.map((item, idx) => (
              <article
                key={item.title}
                className={`group overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-3 backdrop-blur transition hover:-translate-y-2 ${
                  idx === 1 ? "sm:-translate-y-8" : ""
                }`}
              >
                <div className="relative overflow-hidden rounded-[1.5rem] bg-white">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-72 w-full object-cover transition duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "/images/hero/quito.svg";
                    }}
                  />
                  <div className="absolute inset-x-4 bottom-4 h-1 origin-left rounded-full bg-white/70 tech-line" />
                </div>
                <div className="p-3">
                  <h3 className="font-display text-lg font-black">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-white/55">
                    {item.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="concepts" className="relative">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl soft-glow" />
        <div className="absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-black/10 blur-3xl soft-glow" />

        <div className="relative text-center">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-accent">
            Conceptos de ropa
          </p>
          <h2 className="mt-3 font-display text-4xl font-black text-foreground md:text-5xl">
            Inspiración, identidad y diseño
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Cada prenda nace desde una idea visual: cultura, textura, color,
            silueta y estilo. Descubre el concepto detrás de cada colección.
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
                    Concept 0{idx + 1}
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-white/70">
                      Visual Story
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
                    Concepto editorial
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
                    <span className="rounded-full bg-black px-5 py-3 text-xs font-black text-white">
                      Outfit ready
                    </span>
                    <span className="rounded-full border border-black/10 px-5 py-3 text-xs font-black text-foreground">
                      Diseño conceptual
                    </span>
                    <span className="rounded-full border border-black/10 px-5 py-3 text-xs font-black text-foreground">
                      Visual premium
                    </span>
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