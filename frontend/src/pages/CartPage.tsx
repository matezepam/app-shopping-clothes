import { useState } from "react";
import {
  LockKeyhole,
  LogIn,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { formatMoney, fromUsd } from "../lib/currency";

type PaymentMethod = "card" | "paypal" | "skrill" | "googlePay" | "applePay";

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  image: string;
}[] = [
  { id: "card", label: "Tarjeta de crédito", image: "/images/payments/cards.svg" },
  { id: "paypal", label: "PayPal", image: "/images/payments/paypal.svg" },
  { id: "skrill", label: "Skrill", image: "/images/payments/skrill.svg" },
  { id: "googlePay", label: "Google Pay", image: "/images/payments/google-pay.svg" },
  { id: "applePay", label: "Apple Pay", image: "/images/payments/apple-pay.svg" },
];

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
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

  const subtotalUsd = lines.reduce(
    (s, l) => s + l.product.priceUsd * l.quantity,
    0,
  );
  const shippingUsd = lines.length > 0 ? 6.5 : 0;
  const totalUsd = subtotalUsd + shippingUsd;

  async function onCheckout() {
    setErr(null);
    setOk(null);
    try {
      if (!user) {
        setErr(t("cart.loginRequired"));
        return;
      }
      const order = await placeOrder();
      setOk(order.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : t("common.error"));
    }
  }

  function paymentButton(method: (typeof paymentMethods)[0]) {
    const active = paymentMethod === method.id;
    return (
      <button
        type="button"
        onClick={() => setPaymentMethod(method.id)}
        className={`flex min-h-20 items-center justify-center rounded-2xl border bg-white p-2 transition ${
          active
            ? "border-secondary shadow-lg shadow-secondary/20 ring-4 ring-secondary/10"
            : "border-black/10 hover:border-secondary/40"
        }`}
        aria-label={method.label}
      >
        <img src={method.image} alt={method.label} className="h-12 w-full object-contain" />
      </button>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
            Eagle Checkout
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground">
            {t("cart.title")}
          </h1>
        </div>
        {user ? (
          <p className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
            {user.name}
          </p>
        ) : (
          <Link
            to="/login?mode=login"
            className="inline-flex items-center gap-2 rounded-full bg-[#0a0f1a] px-4 py-2 text-sm font-bold text-white transition hover:bg-secondary"
          >
            <LogIn size={16} />
            {t("cart.signInToBuy")}
          </Link>
        )}
      </div>

      {lines.length === 0 ? (
        <div className="rounded-3xl border border-black/10 bg-white p-10 text-center shadow-lg shadow-black/5">
          <p className="text-lg font-bold text-foreground">{t("cart.empty")}</p>
          <Link
            to="/"
            className="mt-5 inline-flex rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-secondary"
          >
            {t("home.ctaShop")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <section className="rounded-3xl border border-black/10 bg-white p-4 shadow-lg shadow-black/5 sm:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {t("cart.items")}
            </h2>
            <ul className="mt-6 divide-y divide-black/10">
              {lines.map((l) => (
                <li key={l.productId} className="flex gap-4 py-5 first:pt-0">
                  <img
                    src={l.product.image}
                    alt=""
                    className="h-24 w-24 shrink-0 rounded-2xl bg-muted object-cover ring-1 ring-black/10"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.35";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-bold text-foreground">
                          {l.product.name}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">
                          {formatMoney(
                            fromUsd(l.product.priceUsd, currency),
                            currency,
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                        onClick={() => removeFromCart(l.productId)}
                        aria-label={t("cart.remove")}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-4 inline-flex items-center rounded-2xl border border-black/10 bg-muted p-1">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-foreground shadow-sm transition hover:bg-secondary hover:text-white"
                        onClick={() => setQuantity(l.productId, l.quantity - 1)}
                        aria-label={t("cart.decrease")}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-12 px-4 text-center text-sm font-bold text-foreground">
                        {l.quantity}
                      </span>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-foreground shadow-sm transition hover:bg-secondary hover:text-white"
                        onClick={() => setQuantity(l.productId, l.quantity + 1)}
                        aria-label={t("cart.increase")}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside className="space-y-6">
            {!user ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-lg shadow-black/5">
                <div className="flex gap-3">
                  <LockKeyhole className="mt-0.5 shrink-0" size={20} />
                  <div>
                    <p className="font-bold">{t("cart.loginRequiredTitle")}</p>
                    <p className="mt-1 text-sm leading-6">
                      {t("cart.loginRequired")}
                    </p>
                    <Link
                      to="/login?mode=login"
                      className="mt-4 inline-flex rounded-2xl bg-[#0a0f1a] px-4 py-2 text-sm font-bold text-white transition hover:bg-secondary"
                    >
                      {t("cart.signInToBuy")}
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}

            <form
              className="rounded-3xl border border-black/10 bg-white p-5 shadow-lg shadow-black/5"
              onSubmit={(e) => {
                e.preventDefault();
                void onCheckout();
              }}
            >
              <h2 className="font-display text-2xl font-bold text-foreground">
                {t("cart.paymentTitle")}
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {paymentMethods.map((method) => paymentButton(method))}
              </div>

              <div className="mt-5 space-y-4">
                {paymentMethod === "card" ? (
                  <>
                    <label className="block text-sm font-bold text-foreground">
                      {t("cart.cardName")}
                      <input
                        className="mt-2 w-full rounded-2xl border border-black/10 bg-muted px-4 py-3 font-semibold outline-none transition placeholder:font-bold placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                        placeholder={t("cart.cardName")}
                        required={user !== null}
                      />
                    </label>
                    <label className="block text-sm font-bold text-foreground">
                      {t("cart.cardNumber")}
                      <input
                        inputMode="numeric"
                        maxLength={19}
                        className="mt-2 w-full rounded-2xl border border-black/10 bg-muted px-4 py-3 font-semibold outline-none transition placeholder:font-bold placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                        placeholder="0000 0000 0000 0000"
                        required={user !== null}
                      />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-sm font-bold text-foreground">
                        {t("cart.expiry")}
                        <input
                          className="mt-2 w-full rounded-2xl border border-black/10 bg-muted px-4 py-3 font-semibold outline-none transition placeholder:font-bold placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                          placeholder="MM/YY"
                          required={user !== null}
                        />
                      </label>
                      <label className="block text-sm font-bold text-foreground">
                        CVV
                        <input
                          inputMode="numeric"
                          maxLength={4}
                          className="mt-2 w-full rounded-2xl border border-black/10 bg-muted px-4 py-3 font-semibold outline-none transition placeholder:font-bold placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                          placeholder="123"
                          required={user !== null}
                        />
                      </label>
                    </div>
                  </>
                ) : paymentMethod === "paypal" || paymentMethod === "skrill" ? (
                  <label className="block text-sm font-bold text-foreground">
                    {paymentMethod === "paypal"
                      ? t("cart.paypalEmail")
                      : t("cart.skrillEmail")}
                    <input
                      type="email"
                      className="mt-2 w-full rounded-2xl border border-black/10 bg-muted px-4 py-3 font-semibold outline-none transition placeholder:font-bold placeholder:text-muted-foreground focus:border-secondary focus:ring-4 focus:ring-secondary/10"
                      placeholder={t("auth.emailPlaceholder")}
                      required={user !== null}
                    />
                  </label>
                ) : (
                  <div className="rounded-2xl border border-black/10 bg-muted p-4">
                    <p className="text-sm font-bold text-foreground">
                      {paymentMethod === "googlePay"
                        ? t("cart.googlePayReady")
                        : t("cart.applePayReady")}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {t("cart.walletNote")}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3 border-t border-black/10 pt-5">
                <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                  <span>{t("cart.subtotal")}</span>
                  <span>{formatMoney(fromUsd(subtotalUsd, currency), currency)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                  <span>{t("cart.shipping")}</span>
                  <span>{formatMoney(fromUsd(shippingUsd, currency), currency)}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                  <span className="font-bold text-foreground">{t("cart.total")}</span>
                  <span className="font-display text-3xl font-bold text-foreground">
                    {formatMoney(fromUsd(totalUsd, currency), currency)}
                  </span>
                </div>
              </div>

              {err ? <p className="mt-4 text-sm font-bold text-red-600">{err}</p> : null}
              {ok ? (
                <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  {t("cart.orderPlaced")}: {ok}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!user}
                className="mt-6 w-full rounded-2xl bg-accent py-4 text-sm font-bold text-white shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-secondary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
              >
                {user ? t("cart.checkout") : t("cart.signInToBuy")}
              </button>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                {t("cart.note")}
              </p>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
