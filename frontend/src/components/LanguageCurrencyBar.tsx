import { useTranslation } from "react-i18next";
import type { CurrencyCode } from "../types/store";
import { persistLanguage } from "../i18n/config";
import { useStore } from "../context/StoreContext";

const langs = [
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "es", label: "ES", flag: "🇪🇨" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "de", label: "DE", flag: "🇩🇪" },
] as const;

const currencies: Array<{ code: CurrencyCode; icon: string }> = [
  { code: "USD", icon: "💵" },
  { code: "EUR", icon: "💶" },
  { code: "GBP", icon: "💷" },
];

export function LanguageCurrencyBar() {
  const { t, i18n } = useTranslation();
  const { currency, setCurrency } = useStore();

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-eagle-sand/90">
      <label className="flex items-center gap-2 rounded-xl border border-eagle-mist/45 bg-eagle-night/30 px-2 py-1">
        <span className="inline-flex items-center gap-1 uppercase tracking-wider text-eagle-sand/60">
          <span aria-hidden>🌐</span>
          {t("common.language")}
        </span>
        <select
          className="rounded-lg border border-eagle-mist/60 bg-eagle-deep/80 px-2 py-1 text-eagle-foam focus:border-eagle-gold focus:outline-none focus:ring-1 focus:ring-eagle-gold"
          value={i18n.language}
          onChange={(e) => {
            const lng = e.target.value;
            void i18n.changeLanguage(lng);
            persistLanguage(lng);
          }}
        >
          {langs.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag} {l.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 rounded-xl border border-eagle-mist/45 bg-eagle-night/30 px-2 py-1">
        <span className="inline-flex items-center gap-1 uppercase tracking-wider text-eagle-sand/60">
          <span aria-hidden>💱</span>
          {t("common.currency")}
        </span>
        <select
          className="rounded-lg border border-eagle-mist/60 bg-eagle-deep/80 px-2 py-1 text-eagle-foam focus:border-eagle-gold focus:outline-none focus:ring-1 focus:ring-eagle-gold"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.icon} {c.code}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
