import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";

const returnStatusLabels: Record<string, string> = {
  REQUESTED: "Solicitada",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  RECEIVED: "Recibida",
};

export function ReturnsPage() {
  const { t } = useTranslation();
  const { user, returns, catalog } = useStore();

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-neutral-950">
          {t("returns.authTitle")}
        </h1>
        <p className="mt-3 text-neutral-500">{t("returns.authText")}</p>
        <Link
          to="/login"
          className="mt-6 rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-neutral-700"
        >
          {t("nav.login")}
        </Link>
      </section>
    );
  }

  return (
    <section className="animate-fade-up space-y-6">
      <div className="rounded-[2rem] bg-[#0a0f1a] p-8 text-white shadow-2xl shadow-black/15">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          {t("returns.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-bold">{t("returns.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
          {t("returns.subtitle")}
        </p>
      </div>

      {returns.length === 0 ? (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-8 text-center shadow-sm">
            <p className="text-xl font-bold text-neutral-950">
              {t("returns.emptyTitle")}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              {t("returns.emptyText")}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/history"
                className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-neutral-950"
              >
                {t("returns.goHistory")}
              </Link>
              <Link
                to="/support"
                className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100"
              >
                {t("returns.goSupport")}
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-950">
              {t("returns.howTitle")}
            </h2>
            <div className="mt-5 grid gap-3">
              {[1, 2, 3].map((step) => (
                <div key={step} className="rounded-2xl bg-neutral-50 p-4">
                  <p className="text-sm font-bold text-neutral-950">
                    {t(`returns.steps.${step}.title`)}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {t(`returns.steps.${step}.text`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <ul className="grid gap-4">
          {returns.map((r) => (
            <li
              key={r.id}
              className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-neutral-400">
                    {r.id.slice(0, 8)}…
                  </p>
                  <p className="mt-2 font-bold text-neutral-950">
                    {t("returns.requestNumber", { id: r.orderId })}
                  </p>
                </div>
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-neutral-950">
                  {returnStatusLabels[r.status] ?? r.status}
                </span>
              </div>
              <p className="mt-4 text-sm text-neutral-600">
                {t("returns.qty")}: {r.quantity} · {catalog.find((product) => product.id === r.productId)?.name ?? r.productId}
              </p>
              <p className="mt-2 text-sm text-neutral-500">{r.reason}</p>
              {r.adminNote ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-800">
                    Respuesta de Sprint
                  </p>
                  <p className="mt-1 text-sm leading-6 text-amber-950">{r.adminNote}</p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
