import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStore } from "../../context/StoreContext";
import { formatMoney, fromUsd } from "../../lib/currency";
import { ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { hasAnyRole, primaryRole, ROLE_CONFIG } from "../../lib/roles";

const userAvatar = "/images/profile/login-avatar.svg";

export default function UserDashboardPage() {
  const { t, i18n } = useTranslation();
  const { user, orders, cart, wishlistProductIds, catalog, currency } = useStore();

  const totalSpentUsd = orders.reduce((sum, order) => sum + order.totalUsd, 0);

  const cartTotalUsd = cart.reduce((sum, item) => {
    const product = catalog.find((p) => p.id === item.productId);
    return sum + (product?.priceUsd ?? 0) * item.quantity;
  }, 0);

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  const recentOrders = orders.slice(0, 3);
  const activeRole = primaryRole(user?.roles);
  const role = ROLE_CONFIG[activeRole];
  const isStaff = hasAnyRole(user?.roles, ["ADMIN", "VENDOR", "MODERATOR"]);

  return (
    <section className="animate-fade-up space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f1a] text-white shadow-2xl shadow-black/20">
        <div className="relative p-8 md:p-10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white shadow-xl">
                <img
                  src={user?.avatarUrl || userAvatar}
                  alt={t("dashboard.avatarAlt")}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
                  {t("dashboard.eyebrow")}
                </p>
                <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                  {t("dashboard.greeting", {
                    name: user?.firstName ?? t("dashboard.fallbackName"),
                  })}
                </h1>
                <p className="mt-2 text-sm text-white/60">
                  {t("dashboard.subtitle")}
                </p>
              </div>
            </div>

            <Link
              to="/profile"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-[#0a0f1a] transition hover:-translate-y-0.5 hover:bg-accent hover:text-white"
            >
              {t("dashboard.configureAccount")}
            </Link>
          </div>
        </div>
      </div>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="surface-card overflow-hidden p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Acceso verificado por Cognito</p>
              <h2 className="mt-2 font-display text-2xl font-black text-neutral-950">Rol: {role.label}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">{role.description}</p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><BadgeCheck size={24} /></span>
          </div>
          {isStaff ? <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link to="/admin" className="primary-action">Gestionar catálogo <ArrowRight size={16} /></Link>
            <Link to="/admin/operations" className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-black transition hover:border-accent hover:text-accent">Centro de operaciones <ArrowRight size={16} /></Link>
          </div> : <Link to="/" className="primary-action mt-5 w-full">Explorar catálogo <ArrowRight size={16} /></Link>}
        </article>

        <article className="surface-card p-6">
          <div className="flex items-center gap-3"><ShieldCheck className="text-accent" size={22} /><h2 className="font-display text-xl font-black">Permisos habilitados</h2></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {role.permissions.map((permission) => <div key={permission} className="flex items-center gap-2 rounded-2xl bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-700"><span className="h-2 w-2 rounded-full bg-emerald-500" />{permission}</div>)}
          </div>
        </article>
      </section>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <p className="text-sm font-medium text-neutral-500">
            {t("dashboard.stats.spent")}
          </p>
          <p className="mt-3 text-3xl font-bold text-neutral-950">
            {formatMoney(fromUsd(totalSpentUsd, currency), currency)}
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            {t("dashboard.stats.spentHint")}
          </p>
        </article>

        <article className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <p className="text-sm font-medium text-neutral-500">
            {t("dashboard.stats.orders")}
          </p>
          <p className="mt-3 text-3xl font-bold text-neutral-950">
            {orders.length}
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            {t("dashboard.stats.ordersHint")}
          </p>
        </article>

        <article className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <p className="text-sm font-medium text-neutral-500">
            {t("dashboard.stats.favorites")}
          </p>
          <p className="mt-3 text-3xl font-bold text-neutral-950">
            {wishlistProductIds.length}
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            {t("dashboard.stats.favoritesHint")}
          </p>
        </article>

        <article className="group rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
          <p className="text-sm font-medium text-neutral-500">
            {t("dashboard.stats.cart")}
          </p>
          <p className="mt-3 text-3xl font-bold text-neutral-950">
            {totalItemsInCart}
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            {t("dashboard.stats.cartHint", {
              amount: formatMoney(fromUsd(cartTotalUsd, currency), currency),
            })}
          </p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-neutral-950">
                {t("dashboard.recent.title")}
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                {t("dashboard.recent.subtitle")}
              </p>
            </div>

            <Link
              to="/history"
              className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-700"
            >
              {t("dashboard.recent.viewHistory")}
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {recentOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
                <p className="font-semibold text-neutral-700">
                  {t("dashboard.recent.emptyTitle")}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {t("dashboard.recent.emptyText")}
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
                      {t("dashboard.recent.orderNumber", { id: order.id })}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {new Date(order.createdAt).toLocaleDateString(i18n.language)}
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
          <h2 className="text-xl font-bold text-neutral-950">
            {t("dashboard.quick.title")}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            {t("dashboard.quick.subtitle")}
          </p>

          <div className="mt-6 grid gap-3">
            <Link
              to="/favorites"
              className="rounded-2xl bg-neutral-50 p-4 font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:bg-neutral-950 hover:text-white"
            >
              {t("dashboard.quick.favorites")}
            </Link>

            <Link
              to="/profile"
              className="rounded-2xl bg-neutral-50 p-4 font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:bg-neutral-950 hover:text-white"
            >
              {t("dashboard.quick.profile")}
            </Link>

            <Link
              to="/profile"
              className="rounded-2xl bg-neutral-50 p-4 font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:bg-neutral-950 hover:text-white"
            >
              {t("dashboard.quick.settings")}
            </Link>

            <Link
              to="/cart"
              className="rounded-2xl bg-primary/20 p-4 font-semibold text-neutral-950 transition hover:-translate-y-0.5 hover:bg-primary"
            >
              {t("dashboard.quick.cart")}
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}
