import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  api,
  type AdminReturnRow,
  type AdminStats,
} from "../../lib/api";
import { useStore } from "../../context/StoreContext";
import { formatMoney } from "../../lib/currency";

export function AdminPage() {
  const { t } = useTranslation();
  const { user, token } = useStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [returns, setReturns] = useState<AdminReturnRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!token || user?.role !== "admin") return;
    let cancelled = false;
    void (async () => {
      try {
        const [s, r] = await Promise.all([
          api.adminStats(token),
          api.adminReturns(token),
        ]);
        if (!cancelled) {
          setStats(s);
          setReturns(r.returns);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : t("common.error"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, user, t]);

  if (!user) {
    return (
      <p className="text-eagle-sand/80">
        <Link to="/login" className="text-eagle-gold underline">
          {t("nav.login")}
        </Link>
      </p>
    );
  }

  if (user.role !== "admin") {
    return (
      <p className="text-eagle-gold">{t("admin.forbidden")}</p>
    );
  }

  async function patchReturn(id: string, status: string) {
    if (!token) return;
    setError(null);
    try {
      await api.adminReturnPatch(token, id, { status, adminNote: note || undefined });
      const r = await api.adminReturns(token);
      setReturns(r.returns);
      setNote("");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("common.error"));
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold text-eagle-foam">
          {t("admin.title")}
        </h1>
        <p className="mt-2 text-eagle-sand/75">{t("admin.subtitle")}</p>
        {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
      </div>

      {stats ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-eagle-mist/40 bg-eagle-deep/60 p-4">
              <p className="text-xs uppercase tracking-wider text-eagle-sand/60">
                {t("admin.summaryOrders")}
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-eagle-gold">
                {stats.summary.ordersCount}
              </p>
            </div>
            <div className="rounded-2xl border border-eagle-mist/40 bg-eagle-deep/60 p-4">
              <p className="text-xs uppercase tracking-wider text-eagle-sand/60">
                {t("admin.summaryRevenue")}
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-eagle-gold">
                {formatMoney(stats.summary.revenueUsd, "USD")}
              </p>
            </div>
            <div className="rounded-2xl border border-eagle-mist/40 bg-eagle-deep/60 p-4">
              <p className="text-xs uppercase tracking-wider text-eagle-sand/60">
                {t("admin.summaryUnits")}
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-eagle-gold">
                {stats.summary.unitsSold}
              </p>
            </div>
            <div className="rounded-2xl border border-eagle-mist/40 bg-eagle-deep/60 p-4">
              <p className="text-xs uppercase tracking-wider text-eagle-sand/60">
                {t("admin.summaryReturns")}
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-eagle-gold">
                {stats.summary.returnsPending}
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-eagle-foam">
              {t("admin.top")}
            </h2>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-eagle-mist/40">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-eagle-night/80 text-eagle-sand/70">
                  <tr>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">{t("admin.units")}</th>
                    <th className="p-3">{t("admin.revenue")}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((row) => (
                    <tr
                      key={row.productId}
                      className="border-t border-eagle-mist/30 text-eagle-sand"
                    >
                      <td className="p-3 font-mono text-xs">{row.productId}</td>
                      <td className="p-3">{row.name}</td>
                      <td className="p-3">{row.unitsSold}</td>
                      <td className="p-3">
                        {formatMoney(row.revenueUsd, "USD")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-eagle-foam">
              {t("admin.chart")}
            </h2>
            <div className="mt-4 flex h-40 items-end gap-1 rounded-2xl border border-eagle-mist/40 bg-eagle-deep/40 p-4">
              {stats.revenueByDay.map((d) => {
                const max = Math.max(
                  ...stats.revenueByDay.map((x) => x.revenueUsd),
                  1,
                );
                const h = (d.revenueUsd / max) * 100;
                return (
                  <div
                    key={d.day}
                    className="flex flex-1 flex-col items-center justify-end gap-1"
                  >
                    <div
                      className="w-full max-w-[24px] rounded-t bg-eagle-gold/80"
                      style={{ height: `${Math.max(h, 4)}%` }}
                      title={`${d.day}: ${d.revenueUsd}`}
                    />
                    <span className="rotate-90 text-[9px] text-eagle-sand/50 md:rotate-0">
                      {d.day.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <p className="text-eagle-sand/70">{t("common.loading")}</p>
      )}

      <section>
        <h2 className="font-display text-xl font-semibold text-eagle-foam">
          {t("admin.returnsTitle")}
        </h2>
        <label className="mt-4 block max-w-md text-sm">
          <span className="text-eagle-sand/80">{t("admin.note")}</span>
          <input
            className="mt-1 w-full rounded-xl border border-eagle-mist/50 bg-eagle-night px-3 py-2 text-eagle-foam"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <ul className="mt-6 space-y-4">
          {returns.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-eagle-mist/40 bg-eagle-deep/50 p-4 text-sm"
            >
              <p className="text-eagle-sand/60">{r.userEmail}</p>
              <p className="text-eagle-foam">
                Order {r.orderId.slice(0, 8)}… · {r.productId} × {r.quantity}
              </p>
              <p className="text-eagle-gold">{r.status}</p>
              <p className="text-eagle-sand/80">{r.reason}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg bg-emerald-700/80 px-3 py-1 text-xs"
                  onClick={() => void patchReturn(r.id, "approved")}
                >
                  {t("admin.approve")}
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-red-900/70 px-3 py-1 text-xs"
                  onClick={() => void patchReturn(r.id, "rejected")}
                >
                  {t("admin.reject")}
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-eagle-gold px-3 py-1 text-xs text-eagle-night"
                  onClick={() => void patchReturn(r.id, "refunded")}
                >
                  {t("admin.refund")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
