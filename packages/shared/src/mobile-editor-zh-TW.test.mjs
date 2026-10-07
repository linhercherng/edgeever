import { expect, test } from "bun:test";
import {
  MOBILE_EDITOR_TOOLBAR_ACTIONS,
  getMobileEditorPlaceholder,
  getMobileEditorToolbarLabel,
  getMobileEditorToolbarActionLabel,
  getMobileEditorImageScaleLabel,
  getMobileEditorImageWidthPresetLabel,
} from "./mobile-editor";

test("provides Traditional Chinese labels for the responsive web editor", () => {
  expect(getMobileEditorPlaceholder("zh-TW")).toBe("開始記錄...");
  expect(getMobileEditorToolbarLabel("zh-TW")).toBe("編輯器工具列");
  expect(getMobileEditorImageScaleLabel("zh-TW")).toBe("圖片顯示尺寸");
  expect(getMobileEditorImageWidthPresetLabel("full", "zh-TW")).toBe("填滿");
  for (const { id } of MOBILE_EDITOR_TOOLBAR_ACTIONS) {
    expect(getMobileEditorToolbarActionLabel(id, "zh-TW")).toBeTruthy();
  }
  expect(getMobileEditorToolbarActionLabel("undo", "zh-TW")).toBe("復原");
});
