import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LanguageCurrencyBar } from "./LanguageCurrencyBar";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-eagle-mist/70 bg-eagle-deep py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <p className="font-display text-lg font-bold text-eagle-foam">Eagle</p>
            <p className="text-sm text-eagle-sand/70">
              {t("home.badge")}
            </p>
            <p className="text-xs text-eagle-sand/60">
              Quito - Ecuador · WhatsApp disponible
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-eagle-sand/60">
              {t("footer.about")}
            </p>
            <Link to="/about" className="block text-sm text-eagle-sand/80 hover:text-eagle-foam">
              {t("footer.aboutLink")}
            </Link>
            <Link to="/privacy" className="block text-sm text-eagle-sand/80 hover:text-eagle-foam">
              {t("footer.privacyLink")}
            </Link>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-eagle-sand/60">
              {t("footer.socials")}
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-eagle-mist/60 text-eagle-sand hover:border-eagle-red hover:text-eagle-red" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="18" cy="6" r="1"/></svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-eagle-mist/60 text-eagle-sand hover:border-eagle-red hover:text-eagle-red" aria-label="TikTok">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8.3a7.4 7.4 0 0 1-4.3-1.4v6.2a5.3 5.3 0 1 1-4.6-5.2v2.6a2.7 2.7 0 1 0 2 2.6V2h2.6a4.7 4.7 0 0 0 4.3 3.7z"/></svg>
              </a>
              <a href="https://wa.me/593000000000" target="_blank" rel="noreferrer" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-eagle-mist/60 text-eagle-sand hover:border-eagle-red hover:text-eagle-red" aria-label="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a9 9 0 1 1-16.6 5.1L3 21l4.5-1.3A9 9 0 0 1 21 11.5z"/><path d="M8.5 9.5c.2-.5.4-.5.7-.5h.5c.2 0 .5.1.6.4l.6 1.5c.1.2.1.4 0 .6l-.3.5c-.1.2-.2.3 0 .5.4.8 1.1 1.4 1.9 1.8.2.1.3 0 .5 0l.4-.3c.2-.1.4-.1.6 0l1.4.6c.3.1.4.3.4.6v.5c0 .3 0 .5-.5.7-.7.2-2.1.3-4.4-1-2.6-1.4-3.6-3.5-3.9-4.2-.3-.7-.1-1.3 0-1.7z"/></svg>
              </a>
            </div>
            <p className="text-xs text-eagle-sand/60">
              Ubicación: Quito / Guayaquil
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-eagle-sand/60">
              {t("footer.payments")}
            </p>
            <div className="flex flex-wrap gap-2">
              <a href="#payments" className="rounded-lg border border-eagle-mist/40 bg-eagle-night/40 px-3 py-2 text-xs font-semibold text-eagle-sand/80 hover:border-eagle-red/60 hover:text-eagle-foam">
                Visa
              </a>
              <a href="#payments" className="rounded-lg border border-eagle-mist/40 bg-eagle-night/40 px-3 py-2 text-xs font-semibold text-eagle-sand/80 hover:border-eagle-red/60 hover:text-eagle-foam">
                Mastercard
              </a>
              <a href="#payments" className="rounded-lg border border-eagle-mist/40 bg-eagle-night/40 px-3 py-2 text-xs font-semibold text-eagle-sand/80 hover:border-eagle-red/60 hover:text-eagle-foam">
                AmEx
              </a>
            </div>
            <p
              id="payments"
              className="text-xs text-eagle-sand/60 leading-relaxed"
            >
              {t("footer.paymentHint")}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <LanguageCurrencyBar />
        </div>

        <div className="mt-10 border-t border-eagle-mist/30 pt-6 text-center text-xs text-eagle-sand/60">
          © {new Date().getFullYear()} Eagle — Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

