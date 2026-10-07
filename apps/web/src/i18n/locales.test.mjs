import { afterEach, describe, expect, test } from "bun:test";
import { defaultLocale, getBrowserLocale, getInitialLocale, normalizeLocale, writeStoredLocale } from "./locales.ts";

const originalNavigator = globalThis.navigator;
const originalWindow = globalThis.window;

const setNavigatorLanguages = (languages, language = languages[0]) => {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { languages, language },
  });
};

afterEach(() => {
  if (originalNavigator === undefined) {
    delete globalThis.navigator;
  } else {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
  if (originalWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = originalWindow;
  }
});

describe("web locale resolution", () => {
  test("keeps Chinese and English browser languages on their shipped locales", () => {
    setNavigatorLanguages(["zh-TW", "en-US"]);
    expect(getBrowserLocale()).toBe("zh-TW");
    setNavigatorLanguages(["en-GB"]);
    expect(getBrowserLocale()).toBe("en-US");
    expect(normalizeLocale("zh-Hans")).toBe("zh-CN");
  });

  test("distinguishes Traditional Chinese tags from Simplified Chinese", () => {
    for (const tag of ["zh-TW", "zh_TW", "zh-Hant", "zh-Hant-TW", "zh-HK", "zh-MO", " ZH_hant_hk "]) {
      expect(normalizeLocale(tag)).toBe("zh-TW");
    }
    for (const tag of ["zh", "zh-CN", "zh-SG", "zh-Hans", "zh-Hans-HK"]) {
      expect(normalizeLocale(tag)).toBe("zh-CN");
    }
    setNavigatorLanguages(["fr-FR", "zh-Hant-TW", "en-US"]);
    expect(getBrowserLocale()).toBe("zh-TW");
  });

  test("retains an explicit Traditional Chinese preference across initialization", () => {
    const storage = new Map();
    globalThis.window = { localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    } };
    setNavigatorLanguages(["en-US"]);
    writeStoredLocale("zh-TW");
    expect(getInitialLocale()).toBe("zh-TW");
  });

  test("keeps Japanese browser languages on the shipped ja locale", () => {
    setNavigatorLanguages(["ja-JP", "ja"]);
    expect(getBrowserLocale()).toBe("ja");
  });

  test("keeps Polish browser languages on the shipped pl locale", () => {
    setNavigatorLanguages(["pl-PL", "en-US"]);
    expect(getBrowserLocale()).toBe("pl");
  });

  test("falls unmatched browser languages back to English instead of Chinese", () => {
    setNavigatorLanguages(["fr-FR", "de-DE"]);
    expect(getBrowserLocale()).toBe("en-US");
    setNavigatorLanguages(["ko-KR"]);
    expect(getInitialLocale()).toBe("en-US");
    expect(defaultLocale).toBe("zh-CN");
  });

  test("uses the first supported language in the browser preference list", () => {
    setNavigatorLanguages(["ja-JP", "zh-CN"]);
    expect(getBrowserLocale()).toBe("ja");
    setNavigatorLanguages(["fr-FR", "zh-CN"]);
    expect(getBrowserLocale()).toBe("zh-CN");
  });
});
