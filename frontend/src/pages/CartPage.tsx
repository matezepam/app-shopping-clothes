import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatMoney, fromUsd } from "../lib/currency";

export function CartPage() {
  const { t } = useTranslation();
  const {
    cart,
    catalog,
    currency,
    setQuantity,
    removeFromCart,
    checkout: placeOrder,
    user,
  } = useStore();
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const lines = cart
    .map((c) => {
      const p = catalog.find((x) => x.id === c.productId);
      return p ? { ...c, product: p } : null;
    })
    .filter(Boolean) as {
    productId: string;
    quantity: number;
    product: (typeof catalog)[0];
  }[];

  const totalUsd = lines.reduce(
    (s, l) => s + l.product.priceUsd * l.quantity,
    0,
  );
  const total = fromUsd(totalUsd, currency);

  async function onCheckout() {
    setErr(null);
    setOk(null);
    try {
      if (!user) {
        setErr("Login required");
        return;
      }
      const order = await placeOrder();
      setOk(order.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("common.error"));
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold text-eagle-foam">
        {t("cart.title")}
      </h1>
      {lines.length === 0 ? (
        <p className="mt-6 text-eagle-sand/80">{t("cart.empty")}</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {lines.map((l) => (
            <li
              key={l.productId}
              className="flex gap-4 rounded-2xl border border-eagle-mist/40 bg-eagle-deep/50 p-4"
            >
              <img
                src={l.product.image}
                alt=""
                className="h-20 w-20 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0.3";
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-eagle-foam">{l.product.name}</p>
                <p className="text-sm text-eagle-sand/70">
                  {formatMoney(fromUsd(l.product.priceUsd, currency), currency)}{" "}
                  ×
                  <input
                    type="number"
                    min={1}
                    className="ml-2 w-16 rounded border border-eagle-mist/50 bg-eagle-night px-2 py-1 text-eagle-foam"
                    value={l.quantity}
                    onChange={(e) =>
                      setQuantity(l.productId, Number(e.target.value) || 1)
                    }
                  />
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs text-eagle-gold hover:underline"
                  onClick={() => removeFromCart(l.productId)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {lines.length > 0 ? (
        <div className="mt-8 rounded-2xl border border-eagle-mist/40 bg-eagle-deep/60 p-6">
          <div className="flex items-center justify-between text-lg">
            <span className="text-eagle-sand">{t("cart.total")}</span>
            <span className="font-display text-2xl font-bold text-eagle-gold">
              {formatMoney(total, currency)}
            </span>
          </div>
          <p className="mt-2 text-xs text-eagle-sand/60">{t("cart.note")}</p>
          {!user ? (
            <p className="mt-4 text-sm text-eagle-gold">
              <Link to="/login" className="underline">
                {t("nav.login")}
              </Link>{" "}
              to checkout.
            </p>
          ) : null}
          {err ? <p className="mt-3 text-sm text-red-400">{err}</p> : null}
          {ok ? (
            <p className="mt-3 text-sm text-emerald-400">
              Order placed: {ok}
            </p>
          ) : null}
          <button
            type="button"
            disabled={!user}
            onClick={() => void onCheckout()}
            className="mt-6 w-full rounded-2xl bg-eagle-gold py-3 text-sm font-bold text-eagle-night disabled:opacity-40"
          >
            {t("cart.checkout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
