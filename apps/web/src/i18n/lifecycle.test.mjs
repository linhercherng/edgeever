import { afterAll, beforeAll, expect, test } from "bun:test";

const originals = ["window", "document", "navigator"].map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
const storage = new Map();
let localeModule;

beforeAll(async () => {
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { languages: ["zh-Hant-TW"], language: "zh-Hant-TW" } });
  globalThis.document = { documentElement: { lang: "" } };
  globalThis.window = { localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  } };
  localeModule = await import("./index.ts");
});

afterAll(() => {
  for (const [name, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  }
});

test("loads Traditional Chinese before render and supports switching and system preference", async () => {
  const { default: i18n, bootstrapI18n, changeAppLocalePreference } = localeModule;
  await bootstrapI18n();
  expect(i18n.resolvedLanguage).toBe("zh-TW");
  expect(document.documentElement.lang).toBe("zh-TW");
  expect(i18n.t("settings.languageTitle")).toBe("介面語言");
  await changeAppLocalePreference("en-US");
  expect(i18n.t("common.language")).toBe("Language");
  await changeAppLocalePreference("ja");
  expect(i18n.resolvedLanguage).toBe("ja");
  await changeAppLocalePreference("pl");
  expect(i18n.resolvedLanguage).toBe("pl");
  expect(i18n.t("common.language")).toBe("Język");
  await changeAppLocalePreference("zh-CN");
  expect(i18n.t("common.language")).toBe("语言");
  await changeAppLocalePreference("zh-TW");
  expect(storage.get("edgeever.locale.preference")).toBe("zh-TW");
  expect(i18n.t("common.language")).toBe("語言");
  await changeAppLocalePreference("system");
  expect(storage.has("edgeever.locale.preference")).toBe(false);
  expect(i18n.resolvedLanguage).toBe("zh-TW");
});
