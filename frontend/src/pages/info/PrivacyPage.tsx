import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  ChevronRight,
  Cookie,
  Database,
  FileText,
  Globe2,
  LockKeyhole,
  Mail,
  Scale,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { PageLoader } from "../../components/common/PageLoader";

type PrivacySection = {
  id: string;
  icon: typeof ShieldCheck;
  title: string;
  body: string[];
};

export function PrivacyPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 550);

    return () => window.clearTimeout(timer);
  }, []);

  const sections = useMemo<PrivacySection[]>(
    () => [
      {
        id: "overview",
        icon: FileText,
        title: t("privacy.sections.overview.title", "Resumen"),
        body: [
          t(
            "privacy.sections.overview.p1",
            "Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos la información personal que proporcionas al usar nuestra plataforma."
          ),
          t(
            "privacy.sections.overview.p2",
            "Al acceder o utilizar nuestros servicios, aceptas las prácticas descritas en esta política. Si no estás de acuerdo, debes dejar de usar la plataforma."
          ),
        ],
      },
      {
        id: "data",
        icon: Database,
        title: t(
          "privacy.sections.data.title",
          "Información que recopilamos"
        ),
        body: [
          t(
            "privacy.sections.data.p1",
            "Podemos recopilar información que nos proporcionas directamente, como nombre, correo electrónico, teléfono, dirección de entrega, datos de facturación y detalles necesarios para procesar pedidos."
          ),
          t(
            "privacy.sections.data.p2",
            "También podemos recopilar información técnica, como dirección IP, tipo de navegador, dispositivo, páginas visitadas, actividad dentro del sitio y preferencias de usuario."
          ),
          t(
            "privacy.sections.data.p3",
            "Cuando utilizas métodos de pago, ciertos datos pueden ser procesados por proveedores externos de pago. No almacenamos información completa de tarjetas si el proveedor de pago la gestiona directamente."
          ),
        ],
      },
      {
        id: "use",
        icon: ShieldCheck,
        title: t("privacy.sections.use.title", "Cómo usamos tu información"),
        body: [
          t(
            "privacy.sections.use.p1",
            "Usamos tu información para crear y administrar tu cuenta, procesar compras, gestionar entregas, responder solicitudes de soporte y mejorar la experiencia dentro de la plataforma."
          ),
          t(
            "privacy.sections.use.p2",
            "También podemos utilizar datos para prevenir fraude, proteger la seguridad del servicio, cumplir obligaciones legales y enviarte comunicaciones relacionadas con tu cuenta."
          ),
          t(
            "privacy.sections.use.p3",
            "Solo enviaremos comunicaciones promocionales cuando exista una base válida para hacerlo o cuando hayas aceptado recibirlas."
          ),
        ],
      },
      {
        id: "cookies",
        icon: Cookie,
        title: t("privacy.sections.cookies.title", "Cookies y tecnologías similares"),
        body: [
          t(
            "privacy.sections.cookies.p1",
            "Utilizamos cookies y tecnologías similares para recordar preferencias, mantener sesiones activas, analizar rendimiento y mejorar la navegación."
          ),
          t(
            "privacy.sections.cookies.p2",
            "Puedes configurar tu navegador para rechazar cookies, aunque algunas funciones de la plataforma podrían no funcionar correctamente."
          ),
        ],
      },
      {
        id: "sharing",
        icon: Building2,
        title: t("privacy.sections.sharing.title", "Con quién compartimos datos"),
        body: [
          t(
            "privacy.sections.sharing.p1",
            "Podemos compartir información con proveedores que nos ayudan a operar la plataforma, como servicios de hosting, analítica, pagos, entregas, soporte, seguridad y correo electrónico."
          ),
          t(
            "privacy.sections.sharing.p2",
            "También podemos divulgar información cuando sea necesario para cumplir la ley, responder a procesos legales, proteger nuestros derechos o prevenir actividades fraudulentas."
          ),
          t(
            "privacy.sections.sharing.p3",
            "No vendemos tu información personal a terceros para que la usen en su propio beneficio comercial."
          ),
        ],
      },
      {
        id: "retention",
        icon: LockKeyhole,
        title: t("privacy.sections.retention.title", "Conservación de información"),
        body: [
          t(
            "privacy.sections.retention.p1",
            "Conservamos la información personal durante el tiempo necesario para cumplir los fines descritos en esta política, prestar el servicio, resolver disputas y cumplir obligaciones legales."
          ),
          t(
            "privacy.sections.retention.p2",
            "Cuando la información ya no sea necesaria, tomaremos medidas razonables para eliminarla, anonimizarla o conservarla únicamente cuando exista una obligación válida."
          ),
        ],
      },
      {
        id: "rights",
        icon: UserCheck,
        title: t("privacy.sections.rights.title", "Tus derechos"),
        body: [
          t(
            "privacy.sections.rights.p1",
            "Dependiendo de tu ubicación, puedes tener derecho a acceder, corregir, actualizar, eliminar, limitar u oponerte al tratamiento de tus datos personales."
          ),
          t(
            "privacy.sections.rights.p2",
            "También puedes solicitar información sobre cómo tratamos tus datos o retirar ciertos consentimientos cuando el tratamiento dependa de ellos."
          ),
          t(
            "privacy.sections.rights.p3",
            "Para ejercer tus derechos, puedes contactarnos usando los datos indicados en la sección de contacto."
          ),
        ],
      },
      {
        id: "international",
        icon: Globe2,
        title: t(
          "privacy.sections.international.title",
          "Transferencias internacionales"
        ),
        body: [
          t(
            "privacy.sections.international.p1",
            "Algunos proveedores o sistemas pueden estar ubicados fuera de tu país. En esos casos, aplicaremos medidas razonables para proteger tu información de acuerdo con esta política."
          ),
          t(
            "privacy.sections.international.p2",
            "El uso de la plataforma implica que tu información puede ser procesada en ubicaciones donde operen nuestros servicios o proveedores."
          ),
        ],
      },
      {
        id: "security",
        icon: BadgeCheck,
        title: t("privacy.sections.security.title", "Seguridad"),
        body: [
          t(
            "privacy.sections.security.p1",
            "Aplicamos medidas técnicas y organizativas razonables para proteger la información contra acceso no autorizado, pérdida, alteración, divulgación o destrucción."
          ),
          t(
            "privacy.sections.security.p2",
            "Aunque trabajamos para proteger tus datos, ningún sistema es completamente seguro. Por eso también recomendamos usar contraseñas fuertes y no compartir tus credenciales."
          ),
        ],
      },
      {
        id: "changes",
        icon: Scale,
        title: t("privacy.sections.changes.title", "Cambios en esta política"),
        body: [
          t(
            "privacy.sections.changes.p1",
            "Podemos actualizar esta Política de Privacidad ocasionalmente. Cuando realicemos cambios importantes, publicaremos la versión actualizada en esta página."
          ),
          t(
            "privacy.sections.changes.p2",
            "La fecha de actualización indicará cuándo entró en vigor la versión más reciente."
          ),
        ],
      },
    ],
    [t]
  );

  if (loading) {
    return <PageLoader />;
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-eagle-mist/25 bg-[#090f18] text-eagle-foam shadow-2xl shadow-black/30">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-eagle-gold/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-eagle-mist/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-eagle-gold/60 to-transparent" />
      </div>

      <div className="relative z-10 border-b border-eagle-mist/20 bg-eagle-deep/40 px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-eagle-mist/25 bg-eagle-night/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-eagle-sand/80">
              <ShieldCheck size={15} className="text-eagle-gold" />
              {t("privacy.badge", "Legal / Privacy")}
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-eagle-foam sm:text-5xl">
              {t("privacy.title", "Política de privacidad")}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-eagle-sand/75">
              {t(
                "privacy.subtitle",
                "Esta página explica qué datos recopilamos, cómo los usamos, con quién podemos compartirlos y qué derechos tienes sobre tu información."
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-eagle-mist/20 bg-eagle-night/70 p-4 lg:min-w-64">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-eagle-sand/50">
              {t("privacy.effectiveDateLabel", "Fecha efectiva")}
            </p>

            <p className="mt-2 font-display text-xl font-bold text-eagle-foam">
              {t("privacy.effectiveDate", "31 de mayo de 2026")}
            </p>

            <p className="mt-2 text-xs leading-5 text-eagle-sand/60">
              {t(
                "privacy.effectiveNote",
                "Esta política puede actualizarse conforme evolucione la plataforma."
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-eagle-mist/20 bg-eagle-deep/35 p-5 lg:block">
          <div className="sticky top-24">
            <p className="mb-4 px-3 text-xs font-bold uppercase tracking-[0.18em] text-eagle-sand/50">
              {t("privacy.contents", "Contenido")}
            </p>

            <nav className="space-y-1">
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={() => setActiveSection(section.id)}
                    className={`group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-eagle-gold text-eagle-night"
                        : "text-eagle-sand/70 hover:bg-eagle-night/70 hover:text-eagle-foam"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                        isActive
                          ? "bg-eagle-night/15"
                          : "bg-eagle-night text-eagle-gold"
                      }`}
                    >
                      <Icon size={16} />
                    </span>

                    <span className="line-clamp-1">
                      {String(index + 1).padStart(2, "0")}. {section.title}
                    </span>
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="p-5 sm:p-8 lg:p-10">
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-eagle-mist/20 bg-eagle-deep/60 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-eagle-sand/50">
                {t("privacy.quick.ownerLabel", "Responsable")}
              </p>
              <p className="mt-2 font-display text-xl font-bold text-eagle-foam">
                {t("privacy.quick.owner", "Sprint Store")}
              </p>
            </div>

            <div className="rounded-3xl border border-eagle-mist/20 bg-eagle-deep/60 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-eagle-sand/50">
                {t("privacy.quick.scopeLabel", "Alcance")}
              </p>
              <p className="mt-2 font-display text-xl font-bold text-eagle-foam">
                {t("privacy.quick.scope", "Sitio web y servicios")}
              </p>
            </div>

            <div className="rounded-3xl border border-eagle-mist/20 bg-eagle-deep/60 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-eagle-sand/50">
                {t("privacy.quick.contactLabel", "Contacto")}
              </p>
              <a
                href="mailto:support@sprintstore.com"
                className="mt-2 inline-flex items-center gap-2 font-display text-xl font-bold text-eagle-gold transition hover:text-eagle-foam"
              >
                support@sprintstore.com
                <ArrowUpRight size={17} />
              </a>
            </div>
          </div>

          <div className="space-y-5">
            {sections.map((section, index) => {
              const Icon = section.icon;

              return (
                <article
                  key={section.id}
                  id={section.id}
                  onMouseEnter={() => setActiveSection(section.id)}
                  className="scroll-mt-28 rounded-3xl border border-eagle-mist/20 bg-eagle-deep/55 p-5 shadow-xl shadow-black/10 transition hover:border-eagle-gold/35 sm:p-7"
                >
                  <header className="mb-5 flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-eagle-gold/12 text-eagle-gold">
                      <Icon size={23} />
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-eagle-sand/45">
                        {t("privacy.sectionLabel", "Sección")}{" "}
                        {String(index + 1).padStart(2, "0")}
                      </p>

                      <h2 className="mt-1 font-display text-2xl font-bold text-eagle-foam">
                        {section.title}
                      </h2>
                    </div>
                  </header>

                  <div className="space-y-4">
                    {section.body.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-sm leading-7 text-eagle-sand/78"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8 rounded-3xl border border-eagle-gold/25 bg-eagle-gold/10 p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-2xl font-bold text-eagle-foam">
                  {t("privacy.contact.title", "Contacto sobre privacidad")}
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-eagle-sand/75">
                  {t(
                    "privacy.contact.description",
                    "Para preguntas, solicitudes o reclamos relacionados con el tratamiento de tus datos personales, puedes escribirnos por correo electrónico."
                  )}
                </p>
              </div>

              <a
                href="mailto:support@sprintstore.com"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-eagle-gold px-5 py-3 text-sm font-bold text-eagle-night shadow-lg shadow-eagle-gold/20 transition hover:-translate-y-0.5 hover:bg-eagle-foam"
              >
                <Mail size={18} />
                {t("privacy.contact.button", "Enviar solicitud")}
                <ChevronRight size={17} />
              </a>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}