import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Tarjima fayllarni import qilamiz
import translationEN from "./locales/en.json";
import translationRU from "./locales/ru.json";
import translationUZ from "./locales/uz.json";

i18n
  .use(LanguageDetector) // avtomatik til aniqlovchi (browserdan oladi)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translationEN },
      ru: { translation: translationRU },
      uz: { translation: translationUZ },
    },
    fallbackLng: "en", // default til
    interpolation: { escapeValue: false }, // React escape qiladi allaqachon
  });

export default i18n;
