import { useTranslation } from "react-i18next";
import type { CurrencyCode } from "../../types/store";
import { persistLanguage } from "../../i18n/config";
import { useStore } from "../../context/StoreContext";

const langs = [
  { code: "en", label: "ENGLISH", flag: "🇺🇸" },
  { code: "es", label: "ESPAÑOL", flag: "🇪🇨" },
  { code: "fr", label: "FRANÇAIS", flag: "🇫🇷" },
  { code: "de", label: "DEUTSCH", flag: "🇩🇪" },
] as const;

const currencies: Array<{ code: CurrencyCode; icon: string }> = [
  { code: "USD", icon: "$" },
  { code: "EUR", icon: "€" },
  { code: "GBP", icon: "£" },
];

export function LanguageCurrencyBar() {
  const { i18n } = useTranslation();
  const { currency, setCurrency } = useStore();

  const currentLang = langs.find(l => l.code === i18n.language) || langs[0];

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4">

      <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-2">

        <span className="text-lg">{currentLang.flag}</span>

        <select
          className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
          value={i18n.language}
          onChange={(e) => {
            const lng = e.target.value;
            void i18n.changeLanguage(lng);
            persistLanguage(lng);
          }}
        >
          {langs.map((l) => (
            <option key={l.code} value={l.code} className="text-black">
              {l.label}
            </option>
          ))}
        </select>

      </div>

      <div className="flex items-center gap-3 bg-white/5 border border-white/10 backdrop-blur-sm rounded-full px-4 py-2">

        <span className="text-white/70 text-sm">
          {currencies.find(c => c.code === currency)?.icon}
        </span>

        <select
          className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code} className="text-black">
              {c.code}
            </option>
          ))}
        </select>

      </div>

    </div>
  );
}
