import { describe, expect, test } from "bun:test";
import { zhCN } from "./zh-CN";
import { zhTW } from "./zh-TW";

const leaves = (value, prefix = "") => {
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => leaves(child, `${prefix}.${key}`));
  }
  return [[prefix, value]];
};

describe("Traditional Chinese catalog", () => {
  test("covers every shipped message and preserves interpolation and structured values", () => {
    const source = leaves(zhCN);
    const translated = leaves(zhTW);
    expect(translated.map(([key]) => key)).toEqual(source.map(([key]) => key));
    const translationMap = new Map(translated);
    for (const [key, value] of source) {
      const result = translationMap.get(key);
      if (typeof value === "string") {
        expect(typeof result).toBe("string");
        expect(result.match(/\{\{[^}]+\}\}/g) ?? []).toEqual(value.match(/\{\{[^}]+\}\}/g) ?? []);
      } else {
        expect(result).toEqual(value);
      }
    }
  });

  test("uses Traditional Chinese and Taiwan interface terms", () => {
    expect(zhTW.common.language).toBe("語言");
    expect(zhTW.settings.languageTitle).toBe("介面語言");
    expect(JSON.stringify(zhTW)).toContain("儲存");
    expect(JSON.stringify(zhTW)).toContain("檔案");
    expect(JSON.stringify(zhTW)).not.toMatch(/[简语设笔录网选删帐号]/);
  });
});
