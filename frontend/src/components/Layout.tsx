import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet } from "react-router-dom";
import { EagleLogo } from "./EagleLogo";
import { Footer } from "./Footer";
import { useStore } from "../context/StoreContext";
import { SectionDropdown } from "./SectionDropdown";
import { formatMoney, fromUsd } from "../lib/currency";

function navClass(isActive: boolean) {
  return [
    "rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-eagle-red/15 text-eagle-red"
      : "text-eagle-sand hover:bg-eagle-mist/70 hover:text-eagle-foam",
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
  } = useStore();
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement | null>(null);
  const cartCount = cart.reduce((a, i) => a + i.quantity, 0);
  const wishlistCount = wishlistProductIds.length;
  const cartPreview = useMemo(
    () =>
      cart
        .map((line) => {
          const p = catalog.find((x) => x.id === line.productId);
          return p
            ? { ...line, name: p.name, price: p.priceUsd, image: p.image }
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

  useEffect(() => {
    function onDown(ev: MouseEvent) {
      if (!userRef.current?.contains(ev.target as Node)) setUserOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-eagle-night bg-eagle-mesh">
      <header className="sticky top-0 z-40 border-b border-eagle-mist/70 bg-eagle-night/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="shrink-0">
            <EagleLogo />
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>
              {t("nav.home")}
            </NavLink>
            <SectionDropdown sectionId="men" />
            <SectionDropdown sectionId="women" />
            <SectionDropdown sectionId="souvenirs" />
          </nav>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="group relative pb-2">
              <button
                type="button"
                className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-eagle-sand hover:bg-eagle-mist/70 hover:text-eagle-red"
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
                <span className="rounded-full bg-eagle-red px-1.5 text-[11px] font-bold text-eagle-night">
                  {wishlistCount}
                </span>
              ) : null}
              </button>
              <div className="pointer-events-none absolute right-0 top-full z-50 w-80 rounded-2xl border border-eagle-mist/70 bg-eagle-deep/95 p-3 shadow-xl opacity-0 translate-y-1 transition group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 group-hover:animate-fade-up">
                <p className="px-1 py-1 text-xs uppercase tracking-wider text-eagle-sand/60">
                  {t("nav.wishlist")}
                </p>
                {wishlistPreview.length === 0 ? (
                  <p className="px-1 py-3 text-sm text-eagle-sand/70">
                    {t("wishlist.empty")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {wishlistPreview.slice(0, 4).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 rounded-xl bg-eagle-night/35 p-2"
                      >
                        <img src={p.image} alt="" className="h-11 w-11 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-eagle-foam">{p.name}</p>
                          <p className="text-xs text-eagle-sand/70">
                            {formatMoney(fromUsd(p.priceUsd, currency), currency)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(p.id)}
                          className="rounded-lg bg-eagle-red px-2 py-1 text-xs font-semibold text-eagle-foam"
                        >
                          + Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="group relative pb-2">
              <button
                type="button"
                className="relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-eagle-sand hover:bg-eagle-mist/70 hover:text-eagle-red"
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
                  <span className="rounded-full bg-eagle-red px-1.5 text-[11px] font-bold text-eagle-night">
                    {cartCount}
                  </span>
                ) : null}
              </button>
              <div className="pointer-events-none absolute right-0 top-full z-50 w-80 rounded-2xl border border-eagle-mist/70 bg-eagle-deep/95 p-3 shadow-xl opacity-0 translate-y-1 transition group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 group-hover:animate-fade-up">
                <p className="px-1 py-1 text-xs uppercase tracking-wider text-eagle-sand/60">
                  {t("nav.cart")}
                </p>
                {cartPreview.length === 0 ? (
                  <p className="px-1 py-3 text-sm text-eagle-sand/70">
                    {t("cart.empty")}
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      {cartPreview.slice(0, 4).map((line) => (
                        <div
                          key={line.productId}
                          className="flex items-center gap-2 rounded-xl bg-eagle-night/35 p-2"
                        >
                          <img src={line.image} alt="" className="h-11 w-11 rounded-lg object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-eagle-foam">{line.name}</p>
                            <p className="text-xs text-eagle-sand/70">
                              {line.quantity} x {formatMoney(fromUsd(line.price, currency), currency)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/cart"
                      className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-eagle-red px-3 py-2 text-sm font-semibold text-eagle-foam hover:bg-eagle-gold hover:text-eagle-night"
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
                onClick={() => setUserOpen((s) => !s)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-eagle-mist/70 bg-eagle-deep text-eagle-sand transition hover:border-eagle-red/60 hover:text-eagle-red"
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
                      className="text-eagle-sand/80"
                      aria-hidden
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
              </button>
              {userOpen ? (
                <div className="absolute right-0 top-12 z-50 w-56 rounded-2xl border border-eagle-mist/70 bg-eagle-deep/95 p-2 shadow-xl animate-fade-up">
                  {!user ? (
                    <>
                      <Link
                        to="/login?mode=login"
                        onClick={() => setUserOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-eagle-sand/80 hover:bg-eagle-mist/35 hover:text-eagle-foam"
                      >
                        {t("nav.login")}
                      </Link>
                      <Link
                        to="/login?mode=register"
                        onClick={() => setUserOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-eagle-sand/80 hover:bg-eagle-mist/35 hover:text-eagle-foam"
                      >
                        {t("auth.register")}
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="px-3 py-2 text-xs text-eagle-sand/60">{user.name}</p>
                      <NavLink to="/history" onClick={() => setUserOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-eagle-sand/80 hover:bg-eagle-mist/35 hover:text-eagle-foam">{t("nav.history")}</NavLink>
                      <NavLink to="/returns" onClick={() => setUserOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-eagle-sand/80 hover:bg-eagle-mist/35 hover:text-eagle-foam">{t("nav.returns")}</NavLink>
                      {user.role === "admin" ? (
                        <NavLink to="/admin" onClick={() => setUserOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-eagle-sand/80 hover:bg-eagle-mist/35 hover:text-eagle-foam">{t("nav.admin")}</NavLink>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserOpen(false);
                        }}
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm text-eagle-sand/80 hover:bg-eagle-mist/35 hover:text-eagle-foam"
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

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
