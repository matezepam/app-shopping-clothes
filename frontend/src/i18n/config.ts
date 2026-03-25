import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { de } from "./locales/de";
import { en } from "./locales/en";
import { es } from "./locales/es";
import { fr } from "./locales/fr";

const STORAGE_KEY = "eagle_lang";

const saved =
  typeof localStorage !== "undefined"
    ? localStorage.getItem(STORAGE_KEY)
    : null;

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
  },
  lng: saved ?? "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export function persistLanguage(lng: string) {
  localStorage.setItem(STORAGE_KEY, lng);
}
