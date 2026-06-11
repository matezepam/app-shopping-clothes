import { useState } from "react";
import {
  Info,
  LogIn,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { formatMoney, fromUsd } from "../../lib/currency";

export function CartPage() {
  const {
    cart,
    catalog,
    currency,
    setQuantity,
    removeFromCart,
    user,
  } = useStore();

  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  const lines = cart
    .map((item) => {
      const product = catalog.find((productItem) => productItem.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as {
    productId: string;
    quantity: number;
    product: (typeof catalog)[0];
  }[];

  const subtotalUsd = lines.reduce(
    (sum, line) => sum + line.product.priceUsd * line.quantity,
    0,
  );

  const shippingUsd = lines.length > 0 ? 6.5 : 0;
  const totalUsd = subtotalUsd + shippingUsd;

  const goToCheckout = () => {
    if (!user) return;
    navigate("/checkout");
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {showInfo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-secondary hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <ShoppingBag size={28} />
            </div>

            <h2 className="mt-5 font-display text-2xl font-bold text-foreground">
              Tu carrito
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Revisa tus productos, modifica cantidades y cuando estés listo continúa al checkout para completar dirección, teléfono y método de pago.
            </p>

            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full rounded-2xl bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-secondary"
            >
              Entendido
            </button>
          </div>
        </div>
      ) : null}

      <div className="mb-6 flex flex-col justify-between gap-4 rounded-[2rem] border border-black/10 bg-white p-5 shadow-lg shadow-black/5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
            <ShoppingBag size={24} />
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Carrito
            </h1>

            <p className="text-sm font-semibold text-muted-foreground">
              {lines.length} {lines.length === 1 ? "producto agregado" : "productos agregados"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-muted px-4 py-3 text-sm font-bold text-foreground transition hover:bg-secondary hover:text-white"
          >
            <Info size={17} />
            Información
          </button>

          {user ? (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
              {user.name}
            </p>
          ) : (
            <Link
              to="/login?mode=login"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0a0f1a] px-4 py-3 text-sm font-bold text-white transition hover:bg-secondary"
            >
              <LogIn size={17} />
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>

      {lines.length === 0 ? (
        <div className="rounded-[2rem] border border-black/10 bg-white p-10 text-center shadow-xl shadow-black/5">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 text-accent">
            <ShoppingBag size={34} />
          </div>

          <p className="mt-5 font-display text-2xl font-bold text-foreground">
            Tu carrito está vacío
          </p>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Agrega productos para poder continuar con tu compra.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-secondary"
          >
            Ir a comprar
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
          <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl shadow-black/5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">
                  Productos
                </p>

                <h2 className="mt-1 font-display text-2xl font-bold text-foreground">
                  Resumen del carrito
                </h2>
              </div>

              <span className="rounded-full bg-muted px-4 py-2 text-sm font-bold text-foreground">
                {lines.length}
              </span>
            </div>

            <ul className="mt-6 space-y-4">
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-muted/60 p-4 shadow-sm transition hover:shadow-lg hover:shadow-black/5"
                >
                  <div className="flex gap-4">
                    <img
                      src={line.product.image}
                      alt={line.product.name}
                      className="h-24 w-24 shrink-0 rounded-2xl bg-muted object-cover ring-1 ring-black/10 sm:h-28 sm:w-28"
                      onError={(event) => {
                        (event.target as HTMLImageElement).style.opacity = "0.35";
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-lg font-bold text-foreground">
                            {line.product.name}
                          </p>

                          <p className="mt-1 text-sm font-bold text-secondary">
                            {formatMoney(
                              fromUsd(line.product.priceUsd, currency),
                              currency,
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(line.productId)}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-2xl border border-black/10 bg-white p-1 shadow-sm">
                          <button
                            type="button"
                            onClick={() => setQuantity(line.productId, line.quantity - 1)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground transition hover:bg-secondary hover:text-white"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="min-w-12 px-4 text-center text-sm font-bold text-foreground">
                            {line.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => setQuantity(line.productId, line.quantity + 1)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground transition hover:bg-secondary hover:text-white"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <p className="rounded-full bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary">
                          {formatMoney(
                            fromUsd(line.product.priceUsd * line.quantity, currency),
                            currency,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:h-fit">
            {!user ? (
              <div className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 text-amber-900 shadow-lg shadow-black/5">
                <p className="font-display text-lg font-bold">
                  Inicia sesión para comprar
                </p>

                <p className="mt-2 text-sm leading-6">
                  Para continuar al checkout necesitas acceder a tu cuenta.
                </p>

                <Link
                  to="/login?mode=login"
                  className="mt-4 inline-flex rounded-2xl bg-[#0a0f1a] px-4 py-2 text-sm font-bold text-white transition hover:bg-secondary"
                >
                  Iniciar sesión
                </Link>
              </div>
            ) : null}

            <div className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-xl shadow-black/5">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Total del pedido
              </h2>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatMoney(fromUsd(subtotalUsd, currency), currency)}</span>
                </div>

                <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                  <span>Envío</span>
                  <span>{formatMoney(fromUsd(shippingUsd, currency), currency)}</span>
                </div>

                <div className="border-t border-black/10 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-display text-xl font-bold text-foreground">
                      Total
                    </span>

                    <span className="font-display text-3xl font-bold text-accent">
                      {formatMoney(fromUsd(totalUsd, currency), currency)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={!user}
                onClick={goToCheckout}
                className="mt-6 w-full rounded-2xl bg-accent py-4 text-sm font-bold text-white shadow-xl shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-secondary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
              >
                Comprar
              </button>

              <p className="mt-3 text-center text-xs font-semibold leading-5 text-muted-foreground">
                En el siguiente paso ingresarás dirección, teléfono y método de pago.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}