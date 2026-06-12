import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const footerLinkClass =
    "block text-white/70 transition-colors hover:text-white";

const socialClass =
    "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:-translate-y-1 hover:bg-secondary hover:text-white";

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

export function Footer() {
  const { t } = useTranslation();

  return (
      <footer className="bg-[#0a0f1a] text-white">
        <div className="container mx-auto px-4 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="space-y-8 lg:col-span-2">
              <Link
                  to="/"
                  onClick={scrollToTop}
                  className="flex w-fit items-center gap-4"
              >
                <div className="flex overflow-hidden rounded-sm">
                  <div className="h-8 w-3 bg-primary" />
                  <div className="h-8 w-3 bg-[#224faf]" />
                  <div className="h-8 w-3 bg-accent" />
                </div>

                <h2 className="font-display text-3xl font-bold">Sprint</h2>
              </Link>

              <p className="max-w-md text-base leading-relaxed text-white/70">
                {t("footer.description")}
              </p>

              <div className="flex gap-4">
                <a href="#" className={socialClass} aria-label="Instagram">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm5 5.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2zm0 1.8A3 3 0 1 0 15 12a3 3 0 0 0-3-3zm5.2-.9a1.1 1.1 0 1 1-1.1-1.1 1.1 1.1 0 0 1 1.1 1.1z" />
                  </svg>
                </a>

                <a href="#" className={socialClass} aria-label="Facebook">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 9h3V5h-3c-3 0-5 2-5 5v2H6v4h3v6h4v-6h3l1-4h-4v-2c0-.6.4-1 1-1z" />
                  </svg>
                </a>

                <a href="#" className={socialClass} aria-label="X">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-7.4L6.4 22H3.3l7.3-8.4L2.8 2h6.4l4.4 6.7L18.9 2zm-1.1 17.9h1.7L8.2 4H6.4l11.4 15.9z" />
                  </svg>
                </a>

                <a href="#" className={socialClass} aria-label="TikTok">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 2c.3 2.4 1.8 4.1 4 4.3v3.4a7.3 7.3 0 0 1-4-1.2v6.7A6.8 6.8 0 1 1 9.2 8.4c.5 0 1 .1 1.5.2v3.6a3.2 3.2 0 1 0 1.8 2.9V2H16z" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <p className="font-display text-xl font-semibold text-primary">
                {t("footer.shop")}
              </p>

              <div className="space-y-3 text-base">
                <Link to="/contact" onClick={scrollToTop} className={footerLinkClass}>
                  {t("footer.contact")}
                </Link>

                <Link to="/location" onClick={scrollToTop} className={footerLinkClass}>
                  {t("footer.address")}
                </Link>

                <Link to="/support" onClick={scrollToTop} className={footerLinkClass}>
                  {t("footer.customerService")}
                </Link>

                <Link to="/faq" onClick={scrollToTop} className={footerLinkClass}>
                  {t("footer.faq")}
                </Link>

                <Link to="/terms" onClick={scrollToTop} className={footerLinkClass}>
                  {t("footer.terms")}
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <p className="font-display text-xl font-semibold text-blue-400">
                {t("footer.company")}
              </p>

              <div className="space-y-3 text-base">
                <Link to="/about" onClick={scrollToTop} className={footerLinkClass}>
                  {t("footer.about")}
                </Link>

                <Link to="/history" onClick={scrollToTop} className={footerLinkClass}>
                  {t("footer.history")}
                </Link>

                <Link to="/login" onClick={scrollToTop} className={footerLinkClass}>
                  {t("footer.login")}
                </Link>

                <Link to="/register" onClick={scrollToTop} className={footerLinkClass}>
                  {t("footer.register")}
                </Link>

                <Link to="/admin" onClick={scrollToTop} className={footerLinkClass}>
                  {t("footer.admin")}
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <p className="font-display text-xl font-semibold text-accent">
                {t("footer.help")}
              </p>

              <div className="space-y-3 text-base">
                <Link to="/returns" onClick={scrollToTop} className={footerLinkClass}>
                  {t("footer.returns")}
                </Link>

                <Link to="/privacy" onClick={scrollToTop} className={footerLinkClass}>
                  {t("footer.privacy")}
                </Link>

                <Link to="/checkout" onClick={scrollToTop} className={footerLinkClass}>
                  {t("footer.paymentMethods")}
                </Link>

                <a href="mailto:contacto@sprint.com" className={footerLinkClass}>
                  {t("footer.emailSupport")}
                </a>

                <a href="tel:+593999999999" className={footerLinkClass}>
                  {t("footer.phoneSupport")}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-6 text-sm text-white/50 lg:px-8">
            <p>{t("footer.rights")}</p>

            <div className="flex overflow-hidden rounded-full">
              <div className="h-2 w-8 bg-primary" />
              <div className="h-2 w-8 bg-blue-500" />
              <div className="h-2 w-8 bg-accent" />
            </div>
          </div>
        </div>
      </footer>
  );
}