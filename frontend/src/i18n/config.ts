import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { de } from "./locales/de";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";

const STORAGE_KEY = "sprint_lang";

const saved =
    typeof localStorage !== "undefined"
        ? localStorage.getItem(STORAGE_KEY)
        : null;

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
  },
  lng: saved ?? "es",
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

export function persistLanguage(lng: string) {
  localStorage.setItem(STORAGE_KEY, lng);
}

export default i18n;
