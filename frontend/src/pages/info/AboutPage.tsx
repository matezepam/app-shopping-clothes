import { ArrowRight, BadgeCheck, Globe2, HeartHandshake, PackageCheck, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AboutPage() {
  const { t } = useTranslation();

  const stats = [
    {
      value: "100%",
      label: t("about.statsAuthentic", "Inspiración ecuatoriana"),
    },
    {
      value: "+500",
      label: t("about.statsProducts", "Productos seleccionados"),
    },
    {
      value: "24/7",
      label: t("about.statsSupport", "Experiencia digital"),
    },
  ];

  const values = [
    {
      icon: Sparkles,
      title: t("about.valueDesignTitle", "Diseño con identidad"),
      description: t(
        "about.valueDesignDescription",
        "Creamos una experiencia visual moderna inspirada en la cultura, colores y paisajes del Ecuador."
      ),
    },
    {
      icon: PackageCheck,
      title: t("about.valueShoppingTitle", "Compra simple"),
      description: t(
        "about.valueShoppingDescription",
        "Categorías claras, productos organizados, carrito, wishlist y un proceso pensado para comprar sin complicaciones."
      ),
    },
    {
      icon: ShieldCheck,
      title: t("about.valueSecureTitle", "Confianza y seguridad"),
      description: t(
        "about.valueSecureDescription",
        "Diseñamos cada sección para transmitir profesionalismo, claridad y seguridad al usuario."
      ),
    },
  ];

  const features = [
    {
      icon: Globe2,
      title: t("about.featureCultureTitle", "Historias del Ecuador"),
      description: t(
        "about.featureCultureDescription",
        "Cada producto puede conectar con una historia, un lugar o una inspiración cultural."
      ),
    },
    {
      icon: HeartHandshake,
      title: t("about.featureUserTitle", "Pensado para usuarios"),
      description: t(
        "about.featureUserDescription",
        "Una plataforma cómoda para turistas, compradores locales y clientes que buscan algo diferente."
      ),
    },
    {
      icon: TrendingUp,
      title: t("about.featureAdminTitle", "Visión comercial"),
      description: t(
        "about.featureAdminDescription",
        "Panel administrativo preparado para analizar ventas, productos destacados, ingresos y devoluciones."
      ),
    },
  ];

  return (
    <div className="space-y-12 overflow-hidden">
      <section className="relative overflow-hidden rounded-[2rem] border border-eagle-mist/40 bg-eagle-deep shadow-2xl shadow-black/20">
        <div className="absolute inset-0">
          <img
            src="/images/hero/galapagos.svg"
            alt={t("about.heroImageAlt", "Paisaje de Ecuador")}
            className="h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(5,10,18,0.96),rgba(5,10,18,0.75),rgba(247,183,51,0.18))]" />
        </div>

        <div className="relative grid gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-eagle-gold/30 bg-eagle-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-eagle-gold animate-pulse">
              <BadgeCheck size={15} />
              {t("about.badge", "Sobre nosotros")}
            </div>

            <h1 className="font-display text-4xl font-black leading-tight text-eagle-foam sm:text-5xl lg:text-6xl">
              {t("about.title", "Eagle Store, una experiencia de compra con esencia ecuatoriana")}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-eagle-sand/85 sm:text-lg">
              {t(
                "about.body",
                "Somos una plataforma de comercio electrónico inspirada en Ecuador, creada para unir diseño moderno, productos atractivos y una experiencia de compra rápida, clara y segura."
              )}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="/shop"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-eagle-gold px-6 py-4 text-sm font-black text-eagle-night shadow-lg shadow-eagle-gold/20 transition hover:-translate-y-1 hover:bg-eagle-sand"
              >
                {t("about.ctaShop", "Explorar tienda")}
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </a>

              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl border border-eagle-mist/40 bg-white/5 px-6 py-4 text-sm font-bold text-eagle-foam backdrop-blur transition hover:-translate-y-1 hover:border-eagle-gold/60 hover:bg-eagle-gold/10 hover:text-eagle-gold"
              >
                {t("about.ctaContact", "Contáctanos")}
              </a>
            </div>
          </div>

          <div className="relative min-h-[360px]">
            <div className="absolute left-0 top-8 h-56 w-48 overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur animate-[float_5s_ease-in-out_infinite] sm:h-72 sm:w-60">
              <img
                src="/images/hero/otavalo.svg"
                alt={t("about.cardImageOneAlt", "Cultura ecuatoriana")}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute right-0 top-0 h-64 w-52 overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur animate-[float_6s_ease-in-out_infinite] sm:h-80 sm:w-64">
              <img
                src="/images/hero/galapagos.svg"
                alt={t("about.cardImageTwoAlt", "Galápagos Ecuador")}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute bottom-0 left-1/2 w-[88%] -translate-x-1/2 rounded-[2rem] border border-eagle-gold/30 bg-eagle-night/80 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-eagle-gold">
                {t("about.heroCardLabel", "Nuestra esencia")}
              </p>
              <p className="mt-2 font-display text-2xl font-black text-eagle-foam">
                {t("about.heroCardTitle", "Moda, cultura y tecnología en un solo lugar")}
              </p>
              <p className="mt-2 text-sm leading-6 text-eagle-sand/75">
                {t(
                  "about.heroCardDescription",
                  "Una tienda pensada para destacar productos con estilo, orden y una identidad visual memorable."
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-[1.7rem] border border-eagle-mist/40 bg-eagle-deep/70 p-6 text-center shadow-lg shadow-black/10 transition hover:-translate-y-1 hover:border-eagle-gold/50 hover:bg-eagle-night"
          >
            <p className="font-display text-4xl font-black text-eagle-gold transition group-hover:scale-110">
              {stat.value}
            </p>
            <p className="mt-2 text-sm font-semibold text-eagle-sand/75">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] border border-eagle-mist/40 bg-eagle-deep/70 p-6 shadow-xl shadow-black/10">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-eagle-gold">
            {t("about.missionLabel", "Misión")}
          </p>

          <h2 className="mt-3 font-display text-3xl font-black text-eagle-foam">
            {t("about.missionTitle", "Crear una tienda clara, moderna y memorable")}
          </h2>

          <p className="mt-4 leading-8 text-eagle-sand/80">
            {t(
              "about.missionDescription",
              "Nuestra misión es ofrecer una experiencia digital donde los usuarios puedan descubrir productos de manera sencilla, visualmente atractiva y con una navegación profesional."
            )}
          </p>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-eagle-mist/30">
            <img
              src="/images/hero/galapagos.svg"
              alt={t("about.missionImageAlt", "Experiencia de compra")}
              className="h-56 w-full object-cover transition duration-700 hover:scale-105"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-[2rem] border border-eagle-mist/40 bg-eagle-deep/70 p-6 shadow-xl shadow-black/10 transition hover:-translate-y-1 hover:border-eagle-gold/50 hover:bg-eagle-night"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-eagle-gold/15 text-eagle-gold transition group-hover:scale-110 group-hover:bg-eagle-gold group-hover:text-eagle-night">
                  <Icon size={24} />
                </div>

                <h3 className="font-display text-xl font-black text-eagle-foam">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-eagle-sand/75">
                  {feature.description}
                </p>
              </div>
            );
          })}

          <div className="rounded-[2rem] border border-eagle-gold/30 bg-[linear-gradient(135deg,rgba(247,183,51,0.18),rgba(10,15,26,0.88))] p-6 shadow-xl shadow-black/10">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-eagle-gold">
              {t("about.visionLabel", "Visión")}
            </p>

            <h3 className="mt-3 font-display text-2xl font-black text-eagle-foam">
              {t("about.visionTitle", "Ser una tienda digital diferente")}
            </h3>

            <p className="mt-3 text-sm leading-7 text-eagle-sand/80">
              {t(
                "about.visionDescription",
                "Queremos que Eagle Store sea reconocida por su estética, facilidad de uso y capacidad para conectar productos con experiencias."
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-eagle-mist/40 bg-eagle-deep/70 p-6 shadow-xl shadow-black/10 sm:p-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-eagle-gold">
              {t("about.valuesLabel", "Lo que nos hace diferentes")}
            </p>

            <h2 className="mt-3 font-display text-3xl font-black text-eagle-foam">
              {t("about.valuesTitle", "Una plataforma pensada para vender mejor")}
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-7 text-eagle-sand/75">
            {t(
              "about.valuesDescription",
              "Combinamos diseño, organización y funcionalidad para construir una experiencia de compra profesional."
            )}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <div
                key={value.title}
                className="group relative overflow-hidden rounded-[1.7rem] border border-eagle-mist/40 bg-eagle-night/60 p-6 transition hover:-translate-y-1 hover:border-eagle-gold/50"
              >
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-eagle-gold/10 blur-2xl transition group-hover:bg-eagle-gold/20" />

                <div className="relative">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-eagle-gold text-eagle-night shadow-lg shadow-eagle-gold/20 transition group-hover:rotate-6 group-hover:scale-110">
                    <Icon size={24} />
                  </div>

                  <h3 className="font-display text-xl font-black text-eagle-foam">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-eagle-sand/75">
                    {value.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] border border-eagle-gold/30 bg-eagle-night p-8 text-center shadow-2xl shadow-black/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(247,183,51,0.24),transparent_45%)]" />

        <div className="relative mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-eagle-gold">
            {t("about.finalLabel", "Eagle Store")}
          </p>

          <h2 className="mt-4 font-display text-3xl font-black text-eagle-foam sm:text-4xl">
            {t("about.finalTitle", "No solo vendemos productos, construimos una experiencia")}
          </h2>

          <p className="mt-4 leading-8 text-eagle-sand/80">
            {t(
              "about.finalDescription",
              "Nuestro objetivo es que cada usuario sienta confianza, comodidad y conexión visual desde que entra a la tienda hasta que finaliza su compra."
            )}
          </p>
        </div>
      </section>
    </div>
  );
}