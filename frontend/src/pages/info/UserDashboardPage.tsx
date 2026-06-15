import { Link } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { formatMoney, fromUsd } from "../../lib/currency";

const userAvatar = "/images/profile/login-avatar.svg";

export default function UserDashboardPage() {
  const { user, orders, cart, wishlistProductIds, catalog, currency } = useStore();

  const totalSpentUsd = orders.reduce((sum, order) => sum + order.totalUsd, 0);

  const cartTotalUsd = cart.reduce((sum, item) => {
    const product = catalog.find((p) => p.id === item.productId);
    return sum + (product?.priceUsd ?? 0) * item.quantity;
  }, 0);

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  const recentOrders = orders.slice(0, 3);

  return (
    <section className="animate-fade-up space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f1a] text-white shadow-2xl shadow-black/20">
        <div className="relative p-8 md:p-10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
                <img
                  src={user?.avatarUrl || userAvatar}
                  alt="User avatar"
                  className="h-14 w-14 object-contain"
                />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                  Dashboard
                </p>
                <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                  Hola, {user?.firstName ?? "usuario"}
                </h1>
                <p className="mt-2 text-sm text-white/60">
                  Revisa tus compras, favoritos y actividad reciente.
                </p>
              </div>
            </div>

            <Link
              to="/settings"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-[#0a0f1a] transition hover:-translate-y-0.5 hover:bg-accent hover:text-white"
            >
              Configurar cuenta
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <p className="text-sm font-medium text-neutral-500">Dinero gastado</p>
          <p className="mt-3 text-3xl font-bold text-neutral-950">
            {formatMoney(fromUsd(totalSpentUsd, currency), currency)}
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            Total acumulado en tus pedidos.
          </p>
        </article>

        <article className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <p className="text-sm font-medium text-neutral-500">Órdenes</p>
          <p className="mt-3 text-3xl font-bold text-neutral-950">
            {orders.length}
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            Compras registradas en tu cuenta.
          </p>
        </article>

        <article className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <p className="text-sm font-medium text-neutral-500">Favoritos</p>
          <p className="mt-3 text-3xl font-bold text-neutral-950">
            {wishlistProductIds.length}
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            Productos guardados para después.
          </p>
        </article>

        <article className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <p className="text-sm font-medium text-neutral-500">Carrito</p>
          <p className="mt-3 text-3xl font-bold text-neutral-950">
            {totalItemsInCart}
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            {formatMoney(fromUsd(cartTotalUsd, currency), currency)} pendientes.
          </p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">
                Compras recientes
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Tus últimos movimientos aparecerán aquí.
              </p>
            </div>

            <Link
              to="/history"
              className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
            >
              Ver historial
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {recentOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
                <p className="font-semibold text-neutral-700">
                  Todavía no tienes compras.
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Cuando realices un pedido, aparecerá en este panel.
                </p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4 transition hover:bg-neutral-100"
                >
                  <div>
                    <p className="font-semibold text-neutral-900">
                      Pedido #{order.id}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-neutral-950">
                      {formatMoney(fromUsd(order.totalUsd, currency), currency)}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-neutral-400">
                      {order.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-neutral-950">Accesos rápidos</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Gestiona tu cuenta desde aquí.
          </p>

          <div className="mt-6 grid gap-3">
            <Link
              to="/favorites"
              className="rounded-2xl bg-neutral-50 p-4 font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:bg-neutral-950 hover:text-white"
            >
              Mis favoritos
            </Link>

            <Link
              to="/profile"
              className="rounded-2xl bg-neutral-50 p-4 font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:bg-neutral-950 hover:text-white"
            >
              Mi perfil
            </Link>

            <Link
              to="/settings"
              className="rounded-2xl bg-neutral-50 p-4 font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:bg-neutral-950 hover:text-white"
            >
              Configuraciones
            </Link>

            <Link
              to="/cart"
              className="rounded-2xl bg-primary/20 p-4 font-semibold text-neutral-950 transition hover:-translate-y-0.5 hover:bg-primary"
            >
              Ver carrito
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}