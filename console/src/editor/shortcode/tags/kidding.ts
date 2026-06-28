import type { ShortcodeAttrs, ShortcodeDefinition } from "../core/types";
import { escapeHtml, normalizeColour } from "../core/utils";

/** 删除线文字的默认颜色。 */
const DEFAULT_KIDDING_TEXT_COLOUR = "#111111";

/**
 * 删除线标签实现。
 */
export const kiddingShortcode: ShortcodeDefinition = {
  kind: "kidding",
  settingKey: "enable_kidding",
  title: "删除线",
  keywords: ["kidding", "delete", "shanchuxian", "shortcode"],
  priority: 124,
  block: false,
  fields: [
    {
      name: "text",
      label: "文本",
      type: "text",
      defaultValue: "内容",
    },
    {
      name: "title",
      label: "提示",
      type: "text",
      defaultValue: "提示",
    },
    {
      name: "textColour",
      label: "文字颜色",
      type: "color",
      defaultValue: DEFAULT_KIDDING_TEXT_COLOUR,
    },
  ],
  createDefaultAttrs() {
    return {
      kind: "kidding",
      text: "内容",
      title: "提示",
      textColour: DEFAULT_KIDDING_TEXT_COLOUR,
    };
  },
  render(attrs: ShortcodeAttrs) {
    /** 当前删除线文字最终使用的颜色。 */
    const textColour = normalizeColour(
      attrs.textColour,
      DEFAULT_KIDDING_TEXT_COLOUR
    );
    return `<span class="shortcode-kidding" style="color: ${escapeHtml(
      textColour
    )};text-decoration: line-through;" title="${escapeHtml(
      attrs.title
    )}">${escapeHtml(attrs.text)}</span>`;
  },
};
