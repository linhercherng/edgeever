import {
  defaultLocale as sharedDefaultLocale,
  matchSupportedLocale,
  parseAcceptLanguage,
  unmatchedLocale,
  supportedLocales as sharedSupportedLocales,
} from "@edgeever/shared/i18n/locales";

export const supportedLocales = [...sharedSupportedLocales, "zh-TW"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];
export type AppLocalePreference = "system" | SupportedLocale;

export const defaultLocale: SupportedLocale = sharedDefaultLocale;

export const localeStorageKey = "edgeever.locale.preference";
const legacyLocaleStorageKey = "edgeever.locale";

export const localeLabels: Record<SupportedLocale, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  "en-US": "English",
  ja: "日本語",
  pl: "Polski",
};

export const normalizeLocale = (locale: string | null | undefined): SupportedLocale | null => {
  const tags = locale?.trim().replaceAll("_", "-").toLowerCase().split("-") ?? [];
  if (
    tags[0] === "zh" &&
    !tags.includes("hans") &&
    tags.some((tag) => ["hant", "tw", "hk", "mo"].includes(tag))
  ) {
    return "zh-TW";
  }
  return matchSupportedLocale(locale);
};

export const readStoredLocale = (): SupportedLocale | null => {
  try {
    if (typeof window === "undefined") {
      return null;
    }

    return normalizeLocale(window.localStorage.getItem(localeStorageKey));
  } catch {
    return null;
  }
};

export const writeStoredLocale = (locale: SupportedLocale) => {
  try {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(localeStorageKey, locale);
  } catch {
    // Local storage can be unavailable in private or restricted browser contexts.
  }
};

export const clearStoredLocale = () => {
  try {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(localeStorageKey);
    window.localStorage.removeItem(legacyLocaleStorageKey);
  } catch {
    // Local storage can be unavailable in private or restricted browser contexts.
  }
};

export const getAppLocalePreference = (): AppLocalePreference => readStoredLocale() ?? "system";

/** Returns null only when the browser exposes no language list; unmatched languages become English. */
export const getBrowserLocale = (): SupportedLocale | null => {
  if (typeof navigator === "undefined") {
    return null;
  }

  const browserLocales = navigator.languages?.length ? navigator.languages : [navigator.language];

  if (!browserLocales.some((locale) => locale?.trim())) {
    return null;
  }

  for (const locale of browserLocales) {
    for (const tag of parseAcceptLanguage(locale ?? "")) {
      const matched = normalizeLocale(tag);
      if (matched) return matched;
    }
  }
  return unmatchedLocale;
};

export const getInitialLocale = () => readStoredLocale() ?? getBrowserLocale() ?? defaultLocale;
