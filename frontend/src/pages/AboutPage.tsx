import { useTranslation } from "react-i18next";

export function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-eagle-foam">
        {t("about.title")}
      </h1>
      <div className="rounded-2xl border border-eagle-mist/40 bg-eagle-deep/60 p-6">
        <p className="text-eagle-sand/85 leading-relaxed">{t("about.body")}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-eagle-mist/40 bg-eagle-night/50 p-4">
            <p className="text-xs uppercase tracking-wider text-eagle-sand/60">
              Eagle
            </p>
            <p className="mt-2 font-display text-lg font-semibold text-eagle-gold">
              Ecuador stories
            </p>
            <p className="mt-2 text-sm text-eagle-sand/70">
              Diseño moderno + historia por producto.
            </p>
          </div>
          <div className="rounded-xl border border-eagle-mist/40 bg-eagle-night/50 p-4">
            <p className="text-xs uppercase tracking-wider text-eagle-sand/60">
              Travelers
            </p>
            <p className="mt-2 font-display text-lg font-semibold text-eagle-gold">
              Easy shopping
            </p>
            <p className="mt-2 text-sm text-eagle-sand/70">
              Categorías claras, wishlist y carrito.
            </p>
          </div>
          <div className="rounded-xl border border-eagle-mist/40 bg-eagle-night/50 p-4">
            <p className="text-xs uppercase tracking-wider text-eagle-sand/60">
              Admin
            </p>
            <p className="mt-2 font-display text-lg font-semibold text-eagle-gold">
              Sales insights
            </p>
            <p className="mt-2 text-sm text-eagle-sand/70">
              Top productos, ingresos y devoluciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

