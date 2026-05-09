import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { categorySections, concepts } from "../data/products";

const heroSlides = [
  "/images/hero/galapagos.svg",
  "/images/hero/quito.svg",
  "/images/hero/otavalo.svg",
  "/images/hero/andes.svg",
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
      <section className="grid gap-10 overflow-hidden rounded-3xl border border-black/10 bg-white p-8 shadow-xl shadow-black/5 md:grid-cols-2 md:p-12">
        <div className="flex flex-col justify-center gap-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
            {t("home.badge")}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-foreground md:text-5xl">
            {t("home.title")}
          </h1>
          <p className="max-w-prose text-lg text-muted-foreground">
            {t("home.subtitle")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/category/souvenirs"
              className="rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-secondary"
            >
              {t("home.ctaShop")}
            </Link>
            <a
              href="#concepts"
              className="rounded-2xl border border-black/10 px-6 py-3 text-sm font-bold text-foreground transition hover:border-secondary hover:text-secondary"
            >
              {t("home.ctaConcepts")}
            </a>
          </div>
        </div>
        <div className="relative min-h-[260px] overflow-hidden rounded-2xl ring-1 ring-black/10">
          {heroSlides.map((img, idx) => (
            <img
              key={img}
              src={img}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                idx === slide ? "opacity-100" : "opacity-0"
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/hero/galapagos.svg";
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
                  idx === slide ? "bg-accent" : "bg-white/70"
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold text-foreground">
          {t("home.sections")}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {categorySections.map((s) => (
            <Link
              key={s.id}
              to={`/category/${s.id}`}
            className="group rounded-2xl border border-black/10 bg-white p-6 shadow-lg shadow-black/5 transition hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-black/10"
            >
              <h3 className="font-display text-xl font-bold text-foreground group-hover:text-accent">
                {t(`categories.${s.id}`)}
              </h3>
              <p className="mt-2 text-sm font-semibold text-muted-foreground">
                {s.categories.map((c) => t(`categories.${c}`)).join(" · ")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section id="concepts">
        <h2 className="font-display text-2xl font-bold text-foreground">
          {t("home.conceptsTitle")}
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t("home.conceptsLead")}</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {concepts.map((c) => (
            <article key={c.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg shadow-black/5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10">
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
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {t(`concepts.${c.id}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
