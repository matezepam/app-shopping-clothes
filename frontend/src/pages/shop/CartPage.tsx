import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Info,
  LogIn,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { formatMoney, fromUsd } from "../../lib/currency";

const userAvatar = "/images/profile/login-avatar.svg";

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

  const userFullName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    : "";

  const lines = useMemo(
    () =>
      cart
        .map((item) => {
          const product = catalog.find(
            (productItem) => productItem.id === item.productId,
          );

          return product ? { ...item, product } : null;
        })
        .filter(Boolean) as {
        productId: string;
        quantity: number;
        product: (typeof catalog)[0];
      }[],
    [cart, catalog],
  );

  const subtotalUsd = useMemo(
    () =>
      lines.reduce(
        (sum, line) => sum + line.product.priceUsd * line.quantity,
        0,
      ),
    [lines],
  );

  const shippingUsd = lines.length > 0 ? 6.5 : 0;
  const totalUsd = subtotalUsd + shippingUsd;

  const totalItems = lines.reduce((sum, line) => sum + line.quantity, 0);

  const goToCheckout = () => {
    if (!user) return;
    navigate("/checkout");
  };

  return (
    <div className="mx-auto w-full max-w-7xl animate-fade-up">
      {showInfo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-secondary hover:text-white"
              aria-label="Cerrar información"
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
              Revisa tus productos, modifica cantidades y continúa al checkout
              cuando estés listo. Para comprar necesitas iniciar sesión.
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

      <div className="mb-6 overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-lg shadow-black/5">
        <div className="relative bg-[#0a0f1a] p-6 text-white sm:p-7">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-[#0a0f1a] shadow-lg shadow-black/20">
                <ShoppingBag size={26} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                  Sprint checkout
                </p>

                <h1 className="mt-1 font-display text-3xl font-bold">
                  Carrito
                </h1>

                <p className="mt-1 text-sm text-white/60">
                  {lines.length}{" "}
                  {lines.length === 1
                    ? "producto agregado"
                    : "productos agregados"}{" "}
                  · {totalItems} {totalItems === 1 ? "unidad" : "unidades"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowInfo(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/15 hover:text-white"
              >
                <Info size={17} />
                Información
              </button>

              {user ? (
                <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-white">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                    <img
                      src={user.avatarUrl || userAvatar}
                      alt={userFullName || "Usuario"}
                      className="h-7 w-7 object-contain"
                    />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">
                      {userFullName || "Usuario"}
                    </p>
                    <p className="truncate text-xs text-white/50">
                      {user.email}
                    </p>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-[#0a0f1a] transition hover:bg-accent hover:text-white"
                >
                  <LogIn size={17} />
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
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
                  className="rounded-3xl border border-black/10 bg-gradient-to-br from-white to-muted/60 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
                >
                  <div className="flex gap-4">
                    <img
                      src={line.product.image}
                      alt={line.product.name}
                      className="h-24 w-24 shrink-0 rounded-2xl bg-muted object-cover ring-1 ring-black/10 sm:h-28 sm:w-28"
                      onError={(event) => {
                        (event.target as HTMLImageElement).style.opacity =
                          "0.35";
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-display text-lg font-bold text-foreground">
                            {line.product.name}
                          </p>

                          <p className="mt-1 text-sm font-bold text-secondary">
                            {formatMoney(
                              fromUsd(line.product.priceUsd, currency),
                              currency,
                            )}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                              {line.product.subcategory}
                            </span>

                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                              {line.product.color}
                            </span>
                          </div>
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
                            onClick={() =>
                              setQuantity(line.productId, line.quantity - 1)
                            }
                            disabled={line.quantity <= 1}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground transition hover:bg-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-muted disabled:hover:text-foreground"
                            aria-label="Disminuir una unidad"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="min-w-12 px-4 text-center text-sm font-bold text-foreground">
                            {line.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setQuantity(line.productId, line.quantity + 1)
                            }
                            disabled={line.quantity >= (line.product.stock ?? 0)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-foreground transition hover:bg-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-muted disabled:hover:text-foreground"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <p className="text-xs font-semibold text-muted-foreground">
                          Ajusta unidades con − y +. La papelera elimina toda la línea.
                        </p>

                        <p className="rounded-full bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary">
                          {formatMoney(
                            fromUsd(
                              line.product.priceUsd * line.quantity,
                              currency,
                            ),
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
                  to="/login"
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0a0f1a] px-5 py-3 text-sm font-bold text-white transition hover:bg-secondary"
                >
                  <LogIn size={17} />
                  Iniciar sesión
                </Link>
              </div>
            ) : (
              <div className="rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 text-emerald-900 shadow-lg shadow-black/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-white">
                    <CheckCircle2 size={22} />
                  </div>

                  <div>
                    <p className="font-display text-lg font-bold">
                      Cuenta activa
                    </p>
                    <p className="text-sm text-emerald-700">
                      Puedes continuar al checkout.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <section className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-xl shadow-black/5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <ShieldCheck size={24} />
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">
                    Resumen
                  </p>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Orden
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold text-foreground">
                    {formatMoney(fromUsd(subtotalUsd, currency), currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-bold text-foreground">
                    {formatMoney(fromUsd(shippingUsd, currency), currency)}
                  </span>
                </div>

                <div className="border-t border-black/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-lg font-bold text-foreground">
                      Total
                    </span>

                    <span className="font-display text-2xl font-bold text-accent">
                      {formatMoney(fromUsd(totalUsd, currency), currency)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={goToCheckout}
                disabled={!user}
                className={[
                  "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition",
                  user
                    ? "bg-accent text-white hover:bg-secondary"
                    : "cursor-not-allowed bg-muted text-muted-foreground",
                ].join(" ")}
              >
                Continuar al checkout
                <ArrowRight size={17} />
              </button>

              {!user ? (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Debes iniciar sesión para finalizar la compra.
                </p>
              ) : null}
            </section>

            <section className="rounded-[2rem] border border-black/10 bg-[#0a0f1a] p-5 text-white shadow-xl shadow-black/10">
              <p className="font-display text-lg font-bold">Compra segura</p>

              <p className="mt-2 text-sm leading-6 text-white/60">
                Tus datos se procesan de forma segura. El pago y la dirección se
                completarán en el siguiente paso.
              </p>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
