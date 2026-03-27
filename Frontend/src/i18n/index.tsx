import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Locale, TranslationKeys, Translations } from "./types";
import { en } from "./locales/en";
import { tn } from "./locales/tn";

const translations: Record<Locale, Translations> = { en, tn };

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLocale(): Locale {
  const stored = localStorage.getItem("bocra_locale");
  if (stored === "en" || stored === "tn") return stored;
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("bocra_locale", next);
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: TranslationKeys): string => translations[locale][key] ?? translations.en[key] ?? key,
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
