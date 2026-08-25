import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { formatMoney, fromUsd } from "../../lib/currency";
import type { Order } from "../../types/store";

const orderStatusLabels: Record<string, string> = {
  PENDING_WHATSAPP: "Pendiente de confirmación por WhatsApp",
  CONFIRMED: "Confirmado",
  PREPARING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export function HistoryPage() {
  const { t, i18n } = useTranslation();
  const { user, orders, returns, currency, requestReturn } = useStore();
  const [modal, setModal] = useState<{
    order: Order;
    productId: string;
    maxQty: number;
  } | null>(null);
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-neutral-950">
          {t("history.authTitle")}
        </h1>
        <p className="mt-3 text-neutral-500">{t("history.authText")}</p>
        <Link
          to="/login"
          className="mt-6 rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-neutral-700"
        >
          {t("nav.login")}
        </Link>
      </section>
    );
  }

  async function submitReturn() {
    if (!modal) return;
    setMsg(null);
    try {
      await requestReturn({
        orderId: modal.order.id,
        productId: modal.productId,
        quantity: qty,
        reason,
      });
      setMsg(t("history.returnSuccess"));
      setModal(null);
      setReason("");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("common.error"));
    }
  }

  return (
    <section className="animate-fade-up space-y-6">
      <div className="rounded-[2rem] bg-[#0a0f1a] p-8 text-white shadow-2xl shadow-black/15">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
          {t("history.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-bold">{t("history.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
          {t("history.subtitle")}
        </p>
      </div>

      {msg ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {msg}
        </p>
      ) : null}

      {orders.length === 0 ? (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-dashed border-neutral-300 bg-white p-8 text-center shadow-sm">
            <p className="text-xl font-bold text-neutral-950">
              {t("history.emptyTitle")}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-neutral-500">
              {t("history.emptyText")}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/"
                className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary hover:text-neutral-950"
              >
                {t("history.goShop")}
              </Link>
              <Link
                to="/favorites"
                className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-100"
              >
                {t("history.goFavorites")}
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-neutral-950">
              {t("history.summaryTitle")}
            </h2>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm text-neutral-500">{t("history.summaryOrders")}</p>
                <p className="mt-1 text-2xl font-black text-neutral-950">0</p>
              </div>
              <div className="rounded-2xl bg-neutral-50 p-4">
                <p className="text-sm text-neutral-500">{t("history.summaryReturns")}</p>
                <p className="mt-1 text-2xl font-black text-neutral-950">0</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ul className="grid gap-5">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-sm text-neutral-400">
                  {o.id.slice(0, 8)}…
                </span>
                <span className="text-sm text-neutral-500">
                  {new Date(o.createdAt).toLocaleString(i18n.language)}
                </span>
              </div>
              <p className="mt-3 text-sm font-bold text-primary">
                {t("history.status")}: {orderStatusLabels[o.status] ?? o.status}
              </p>
              <p className="mt-1 text-lg font-semibold text-neutral-950">
                {t("history.total")}:{" "}
                {formatMoney(fromUsd(o.totalUsd, currency), currency)}
              </p>
              {o.status === "PENDING_WHATSAPP" ? (
                <a href={o.whatsappUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Continuar por WhatsApp</a>
              ) : null}
              <ul className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
                {o.items.map((i) => {
                  const alreadyRequested = returns
                    .filter((request) => request.orderId === o.id && request.productId === i.productId && request.status !== "REJECTED")
                    .reduce((total, request) => total + request.quantity, 0);
                  const availableToReturn = Math.max(0, i.quantity - alreadyRequested);
                  return <li
                    key={`${o.id}-${i.productId}`}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span className="font-semibold text-neutral-700">
                      {i.name} × {i.quantity}
                    </span>
                    {o.status === "DELIVERED" && availableToReturn > 0 ? <button
                      type="button"
                      className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-bold text-neutral-700 transition hover:bg-neutral-100"
                      onClick={() => {
                        setModal({
                          order: o,
                          productId: i.productId,
                          maxQty: availableToReturn,
                        });
                        setQty(1);
                        setReason("");
                        setMsg(null);
                      }}
                    >
                      {t("history.returnCta")}
                    </button> : o.status === "DELIVERED" && alreadyRequested > 0 ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Devolución registrada</span> : null}
                  </li>;
                })}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-eagle-mist/40 bg-eagle-deep p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">
              {t("returnForm.title")}
            </h2>
            <label className="mt-4 block text-sm">
              <span className="text-eagle-sand/80">{t("returnForm.quantity")}</span>
              <input
                type="number"
                min={1}
                max={modal.maxQty}
                className="mt-1 w-full rounded-xl border border-eagle-mist/50 bg-eagle-night px-3 py-2 text-eagle-foam"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value) || 1)}
              />
            </label>
            <label className="mt-3 block text-sm">
              <span className="text-eagle-sand/80">{t("returnForm.reason")}</span>
              <textarea
                className="mt-1 w-full rounded-xl border border-eagle-mist/50 bg-eagle-night px-3 py-2 text-eagle-foam"
                rows={3}
                value={reason}
                placeholder={t("returnForm.placeholder")}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </label>
            {msg && msg !== "ok" ? (
              <p className="mt-2 text-sm text-red-400">{msg}</p>
            ) : null}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-xl border border-white/20 py-2 text-white"
                onClick={() => setModal(null)}
              >
                {t("returnForm.cancel")}
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl bg-eagle-gold py-2 font-semibold text-eagle-night"
                onClick={() => void submitReturn()}
              >
                {t("returnForm.submit")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
