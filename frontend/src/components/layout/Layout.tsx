import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router-dom";
import { EagleLogo } from "./Logo";
import { Footer } from "./Footer";
import { useStore } from "../../context/StoreContext";
import { formatMoney, fromUsd } from "../../lib/currency";

const guestAvatar = "/images/profile/default-avatar.svg";
const userAvatar = "/images/profile/login-avatar.svg";

function navClass(isActive: boolean) {
  return [
    "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
    isActive
      ? "bg-white text-[#0a0f1a]"
      : "text-white/70 hover:bg-white/10 hover:text-white",
  ].join(" ");
}

export function Layout() {
  const { t } = useTranslation();

  const {
    user,
    logout,
    cart,
    wishlistProductIds,
    catalog,
    currency,
    addToCart,
    removeFromCart,
    toggleWishlist,
  } = useStore();

  const [userOpen, setUserOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const userRef = useRef<HTMLDivElement | null>(null);
  const wishlistRef = useRef<HTMLDivElement | null>(null);
  const cartRef = useRef<HTMLDivElement | null>(null);

  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
  const wishlistCount = wishlistProductIds.length;

  const userFullName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : "";

  const isAdmin = user?.roles?.includes("ADMIN") ?? false;

  const currentAvatar = user ? user.avatarUrl || userAvatar : guestAvatar;

  const cartPreview = useMemo(
    () =>
      cart
        .map((line) => {
          const p = catalog.find((x) => x.id === line.productId);
          return p
            ? {
                ...line,
                name: p.name,
                price: p.priceUsd,
                image: p.image,
              }
            : null;
        })
        .filter(Boolean) as Array<{
        productId: string;
        quantity: number;
        name: string;
        price: number;
        image: string;
      }>,
    [cart, catalog],
  );

  const wishlistPreview = useMemo(
    () => catalog.filter((p) => wishlistProductIds.includes(p.id)),
    [catalog, wishlistProductIds],
  );

  const cartTotal = useMemo(
    () => cartPreview.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [cartPreview],
  );

  const wishlistTotal = useMemo(
    () => wishlistPreview.reduce((sum, product) => sum + product.priceUsd, 0),
    [wishlistPreview],
  );

  useEffect(() => {
    function onDown(ev: MouseEvent) {
      const target = ev.target as Node;

      if (!userRef.current?.contains(target)) setUserOpen(false);
      if (!wishlistRef.current?.contains(target)) setWishlistOpen(false);
      if (!cartRef.current?.contains(target)) setCartOpen(false);
    }

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0f1a]/95 text-white shadow-lg shadow-black/10 backdrop-blur-md">
        <div className="container mx-auto flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link to="/" className="shrink-0">
            <EagleLogo />
          </Link>

          <nav className="flex flex-wrap items-center gap-2 lg:justify-center">
            <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>
              {t("nav.home")}
            </NavLink>

            <NavLink
              to="/category/men"
              className={({ isActive }) => navClass(isActive)}
            >
              {t("nav.men", { defaultValue: "Men" })}
            </NavLink>

            <NavLink
              to="/category/women"
              className={({ isActive }) => navClass(isActive)}
            >
              {t("nav.women", { defaultValue: "Women" })}
            </NavLink>

            <NavLink
              to="/category/souvenirs"
              className={({ isActive }) => navClass(isActive)}
            >
              {t("nav.souvenirs", { defaultValue: "Souvenirs" })}
            </NavLink>
          </nav>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="relative" ref={wishlistRef}>
              <button
                type="button"
                onClick={() => {
                  setWishlistOpen((open) => !open);
                  setCartOpen(false);
                  setUserOpen(false);
                }}
                aria-expanded={wishlistOpen}
                className="relative inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-white/70 transition-colors hover:bg-secondary hover:text-white"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill={wishlistCount > 0 ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>

                {wishlistCount > 0 ? (
                  <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold text-[#0a0f1a]">
                    {wishlistCount}
                  </span>
                ) : null}
              </button>

              <div
                className={[
                  "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-80 rounded-2xl border border-white/10 bg-[#0a0f1a]/95 p-3 text-white shadow-xl shadow-black/25 backdrop-blur-md transition",
                  wishlistOpen
                    ? "pointer-events-auto translate-y-0 opacity-100 animate-fade-up"
                    : "pointer-events-none translate-y-1 opacity-0",
                ].join(" ")}
              >
                <p className="px-1 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  {t("nav.wishlist")}
                </p>

                {wishlistPreview.length === 0 ? (
                  <p className="px-1 py-3 text-sm text-white/70">
                    {t("wishlist.empty")}
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {wishlistPreview.slice(0, 4).map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2 rounded-xl bg-white/10 p-2"
                        >
                          <img
                            src={p.image}
                            alt=""
                            className="h-11 w-11 rounded-lg object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-white">
                              {p.name}
                            </p>

                            <p className="text-xs text-white/60">
                              {formatMoney(
                                fromUsd(p.priceUsd, currency),
                                currency,
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => addToCart(p.id)}
                            className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-[#0a0f1a] transition-colors hover:bg-accent hover:text-white"
                          >
                            + Cart
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleWishlist(p.id)}
                            aria-label="Eliminar de wishlist"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-accent hover:text-white"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/10 px-1 pt-3 text-sm">
                      <span className="font-semibold text-white/70">Total</span>

                      <span className="font-display text-base font-bold text-primary">
                        {formatMoney(fromUsd(wishlistTotal, currency), currency)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="relative" ref={cartRef}>
              <button
                type="button"
                onClick={() => {
                  setCartOpen((open) => !open);
                  setWishlistOpen(false);
                  setUserOpen(false);
                }}
                aria-expanded={cartOpen}
                className="relative inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold text-white/70 transition-colors hover:bg-secondary hover:text-white"
                aria-label={t("nav.cart")}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>

                {cartCount > 0 ? (
                  <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold text-[#0a0f1a]">
                    {cartCount}
                  </span>
                ) : null}
              </button>

              <div
                className={[
                  "absolute right-0 top-[calc(100%+0.5rem)] z-50 w-80 rounded-2xl border border-white/10 bg-[#0a0f1a]/95 p-3 text-white shadow-xl shadow-black/25 backdrop-blur-md transition",
                  cartOpen
                    ? "pointer-events-auto translate-y-0 opacity-100 animate-fade-up"
                    : "pointer-events-none translate-y-1 opacity-0",
                ].join(" ")}
              >
                <p className="px-1 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  {t("nav.cart")}
                </p>

                {cartPreview.length === 0 ? (
                  <p className="px-1 py-3 text-sm text-white/70">
                    {t("cart.empty")}
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {cartPreview.slice(0, 4).map((line) => (
                        <div
                          key={line.productId}
                          className="flex items-center gap-2 rounded-xl bg-white/10 p-2"
                        >
                          <img
                            src={line.image}
                            alt=""
                            className="h-11 w-11 rounded-lg object-cover"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-white">
                              {line.name}
                            </p>

                            <p className="text-xs text-white/60">
                              {line.quantity} x{" "}
                              {formatMoney(
                                fromUsd(line.price, currency),
                                currency,
                              )}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(line.productId)}
                            aria-label="Eliminar del carrito"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 transition-colors hover:bg-accent hover:text-white"
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-white/10 px-1 pt-3 text-sm">
                      <span className="font-semibold text-white/70">Total</span>

                      <span className="font-display text-base font-bold text-primary">
                        {formatMoney(fromUsd(cartTotal, currency), currency)}
                      </span>
                    </div>

                    <Link
                      to="/cart"
                      onClick={() => setCartOpen(false)}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-primary px-3 py-2 text-sm font-bold text-[#0a0f1a] transition-colors hover:bg-accent hover:text-white"
                    >
                      {t("cart.checkout")}
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="relative" ref={userRef}>
              <button
                type="button"
                onClick={() => {
                  setUserOpen((open) => !open);
                  setWishlistOpen(false);
                  setCartOpen(false);
                }}
                className={[
                  "inline-flex h-11 items-center rounded-full border border-white/10 bg-white/10 text-white/80 transition-colors hover:bg-secondary hover:text-white",
                  user ? "gap-2 px-2 pr-4" : "w-11 justify-center px-0",
                ].join(" ")}
                aria-label={user ? userFullName : "Login"}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95">
                  <img
                    src={currentAvatar}
                    alt={user ? userFullName : "Login"}
                    className="h-6 w-6 object-contain"
                  />
                </span>

                {user ? (
                  <span className="hidden max-w-28 truncate text-sm font-semibold md:inline">
                    {user.firstName}
                  </span>
                ) : null}
              </button>

              {userOpen ? (
                <div className="absolute right-0 top-14 z-50 w-72 rounded-2xl border border-white/10 bg-[#0a0f1a]/95 p-2 text-white shadow-xl shadow-black/25 backdrop-blur-md animate-fade-up">
                  {!user ? (
                    <>
                      <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/10 p-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95">
                          <img
                            src={guestAvatar}
                            alt="Login"
                            className="h-8 w-8 object-contain"
                          />
                        </span>

                        <div>
                          <p className="text-sm font-semibold text-white">
                            {t("auth.welcome", { defaultValue: "Welcome" })}
                          </p>
                          <p className="text-xs text-white/60">
                            {t("auth.accessAccount", {
                              defaultValue: "Access your account",
                            })}
                          </p>
                        </div>
                      </div>

                      <Link
                        to="/login"
                        onClick={() => setUserOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {t("nav.login")}
                      </Link>

                      <Link
                        to="/register"
                        onClick={() => setUserOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {t("auth.register")}
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/10 p-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/95">
                          <img
                            src={user.avatarUrl || userAvatar}
                            alt={userFullName}
                            className="h-9 w-9 object-contain"
                          />
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {userFullName}
                          </p>

                          <p className="truncate text-xs text-white/60">
                            {user.email}
                          </p>

                          <p className="mt-1 inline-flex rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                            {isAdmin ? "ADMIN" : "USER"}
                          </p>
                        </div>
                      </div>

                      <NavLink
                        to="/profile"
                        onClick={() => setUserOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {t("nav.profile", { defaultValue: "Profile" })}
                      </NavLink>

                      <NavLink
                        to="/settings"
                        onClick={() => setUserOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {t("nav.settings", { defaultValue: "Settings" })}
                      </NavLink>

                      <NavLink
                        to="/history"
                        onClick={() => setUserOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {t("nav.history")}
                      </NavLink>

                      <NavLink
                        to="/returns"
                        onClick={() => setUserOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {t("nav.returns")}
                      </NavLink>

                      {isAdmin ? (
                        <NavLink
                          to="/admin"
                          onClick={() => setUserOpen(false)}
                          className="block rounded-xl px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          {t("nav.admin")}
                        </NavLink>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserOpen(false);
                        }}
                        className="mt-2 block w-full rounded-xl px-3 py-2 text-left text-sm text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                      >
                        {t("nav.logout")}
                      </button>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto flex w-full flex-1 flex-col px-4 py-8 lg:px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}