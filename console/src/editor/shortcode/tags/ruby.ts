import type { ShortcodeAttrs, ShortcodeDefinition } from "../core/types";
import { escapeHtml, normalizeColour } from "../core/utils";

/** 注音正文的默认颜色。 */
const DEFAULT_RUBY_TEXT_COLOUR = "#111111";

/**
 * 注音标签实现。
 */
export const rubyShortcode: ShortcodeDefinition = {
  kind: "ruby",
  settingKey: "enable_ruby",
  title: "注音",
  keywords: ["ruby", "zhuyin", "pinyin", "shortcode"],
  priority: 125,
  block: false,
  fields: [
    {
      name: "text",
      label: "正文",
      type: "text",
      defaultValue: "漢字",
    },
    {
      name: "title",
      label: "注音",
      type: "text",
      defaultValue: "han zi",
    },
    {
      name: "textColour",
      label: "文字颜色",
      type: "color",
      defaultValue: DEFAULT_RUBY_TEXT_COLOUR,
    },
  ],
  createDefaultAttrs() {
    return {
      kind: "ruby",
      text: "漢字",
      title: "han zi",
      textColour: DEFAULT_RUBY_TEXT_COLOUR,
    };
  },
  render(attrs: ShortcodeAttrs) {
    /** 当前注音正文最终使用的颜色。 */
    const textColour = normalizeColour(
      attrs.textColour,
      DEFAULT_RUBY_TEXT_COLOUR
    );
    return `<ruby style="color: ${escapeHtml(textColour)};">${escapeHtml(
      attrs.text
    )}<rp>(</rp><rt>${escapeHtml(
      attrs.title
    )}</rt><rp>)</rp></ruby>`;
  },
};
