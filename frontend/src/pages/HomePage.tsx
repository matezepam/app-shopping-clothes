import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { categorySections, concepts } from "../data/products";

const heroSlides = [
  "/templates/hero-galapagos.jpg",
  "/templates/hero-quito.jpg",
  "/templates/hero-otavalo.jpg",
  "/templates/hero-andes.jpg",
];

export function HomePage() {
  const { t } = useTranslation();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide((prev) => (prev + 1) % heroSlides.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-16">
      <section className="grid gap-10 overflow-hidden rounded-3xl border border-eagle-mist/70 bg-eagle-deep p-8 shadow-lg md:grid-cols-2 md:p-12">
        <div className="flex flex-col justify-center gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-eagle-gold">
            {t("home.badge")}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-eagle-foam md:text-5xl">
            {t("home.title")}
          </h1>
          <p className="max-w-prose text-lg text-eagle-sand/85">
            {t("home.subtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/category/souvenirs"
              className="rounded-2xl bg-eagle-red px-6 py-3 text-sm font-bold text-white transition hover:bg-eagle-gold hover:text-eagle-night"
            >
              {t("home.ctaShop")}
            </Link>
            <a
              href="#concepts"
              className="rounded-2xl border border-eagle-mist/60 px-6 py-3 text-sm font-semibold text-eagle-foam transition hover:border-eagle-blue hover:text-eagle-blue"
            >
              {t("home.ctaConcepts")}
            </a>
          </div>
        </div>
        <div className="relative min-h-[260px] overflow-hidden rounded-2xl ring-1 ring-eagle-mist/60">
          {heroSlides.map((img, idx) => (
            <img
              key={img}
              src={img}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                idx === slide ? "opacity-100" : "opacity-0"
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/templates/hero-galapagos.jpg";
              }}
            />
          ))}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSlide(idx)}
                className={`h-2 w-8 rounded-full transition ${
                  idx === slide ? "bg-eagle-red" : "bg-white/60"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-eagle-foam">
          {t("home.sections")}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {categorySections.map((s) => (
            <Link
              key={s.id}
              to={`/category/${s.id}`}
            className="group rounded-2xl border border-eagle-mist/60 bg-white p-6 transition hover:-translate-y-1 hover:border-eagle-red/50"
            >
              <h3 className="font-display text-xl font-semibold text-eagle-foam group-hover:text-eagle-red">
                {t(`categories.${s.id}`)}
              </h3>
              <p className="mt-2 text-sm text-eagle-sand">
                {s.categories.map((c) => t(`categories.${c}`)).join(" · ")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section id="concepts">
        <h2 className="font-display text-2xl font-bold text-eagle-foam">
          {t("home.conceptsTitle")}
        </h2>
        <p className="mt-2 max-w-2xl text-eagle-sand/80">{t("home.conceptsLead")}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {concepts.map((c) => (
            <article key={c.id} className="overflow-hidden rounded-2xl border border-eagle-mist/60 bg-white transition hover:-translate-y-1">
              <div className="grid md:grid-cols-5">
                <div className="relative aspect-video md:col-span-2 md:aspect-auto md:min-h-[200px]">
                  <img
                    src={c.image}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="flex flex-col justify-center p-6 md:col-span-3">
                  <h3 className="font-display text-lg font-semibold text-eagle-gold">
                    {t(`concepts.${c.id}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-eagle-sand/85">
                    {t(`concepts.${c.id}.desc`)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
