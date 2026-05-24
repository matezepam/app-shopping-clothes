import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { formatMoney, fromUsd } from "../../lib/currency";
import type { Order } from "../../types/store";

export function HistoryPage() {
  const { t } = useTranslation();
  const { user, orders, currency, requestReturn } = useStore();
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
      <p className="text-eagle-sand/80">
        <Link to="/login" className="text-eagle-gold underline">
          {t("nav.login")}
        </Link>
      </p>
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
      setMsg("ok");
      setModal(null);
      setReason("");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : t("common.error"));
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-eagle-foam">
        {t("history.title")}
      </h1>
      {orders.length === 0 ? (
        <p className="mt-6 text-eagle-sand/80">{t("history.empty")}</p>
      ) : (
        <ul className="mt-8 space-y-6">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-2xl border border-eagle-mist/40 bg-eagle-deep/50 p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-sm text-eagle-sand/70">
                  {o.id.slice(0, 8)}…
                </span>
                <span className="text-sm text-eagle-sand/60">
                  {new Date(o.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-eagle-gold">
                {t("history.status")}: {o.status}
              </p>
              <p className="text-lg font-semibold text-eagle-foam">
                {t("history.total")}:{" "}
                {formatMoney(fromUsd(o.totalUsd, currency), currency)}
              </p>
              <ul className="mt-4 space-y-2 border-t border-eagle-mist/30 pt-4">
                {o.items.map((i) => (
                  <li
                    key={`${o.id}-${i.productId}`}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-eagle-sand">
                      {i.name} × {i.quantity}
                    </span>
                    <button
                      type="button"
                      className="rounded-lg border border-eagle-mist/50 px-3 py-1 text-xs text-eagle-gold hover:bg-eagle-mist/30"
                      onClick={() => {
                        setModal({
                          order: o,
                          productId: i.productId,
                          maxQty: i.quantity,
                        });
                        setQty(1);
                        setReason("");
                        setMsg(null);
                      }}
                    >
                      {t("history.returnCta")}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-eagle-mist/40 bg-eagle-deep p-6 shadow-2xl">
            <h2 className="font-display text-xl font-bold text-eagle-foam">
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
                className="flex-1 rounded-xl border border-eagle-mist/50 py-2 text-eagle-foam"
                onClick={() => setModal(null)}
              >
                Cancel
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
    </div>
  );
}
