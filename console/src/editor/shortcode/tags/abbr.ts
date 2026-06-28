import type { ShortcodeAttrs, ShortcodeDefinition } from "../core/types";
import { escapeHtml, normalizeColour } from "../core/utils";

/** 缩写文字的默认颜色。 */
const DEFAULT_ABBR_TEXT_COLOUR = "#111111";

/**
 * 缩写标签实现。
 */
export const abbrShortcode: ShortcodeDefinition = {
  kind: "abbr",
  settingKey: "enable_abbr",
  title: "缩写",
  keywords: ["abbr", "suoxie", "shortcode"],
  priority: 120,
  block: false,
  fields: [
    {
      name: "text",
      label: "文本",
      type: "text",
      defaultValue: "HTML",
      placeholder: "显示文本",
    },
    {
      name: "title",
      label: "说明",
      type: "text",
      defaultValue: "HyperText Markup Language",
      placeholder: "鼠标悬停说明",
    },
    {
      name: "textColour",
      label: "文字颜色",
      type: "color",
      defaultValue: DEFAULT_ABBR_TEXT_COLOUR,
    },
  ],
  createDefaultAttrs() {
    return {
      kind: "abbr",
      text: "HTML",
      title: "HyperText Markup Language",
      textColour: DEFAULT_ABBR_TEXT_COLOUR,
    };
  },
  render(attrs: ShortcodeAttrs) {
    /** 当前缩写文字最终使用的颜色。 */
    const textColour = normalizeColour(
      attrs.textColour,
      DEFAULT_ABBR_TEXT_COLOUR
    );
    return `<abbr style="color: ${escapeHtml(textColour)};" title="${escapeHtml(
      attrs.title
    )}">${escapeHtml(
      attrs.text
    )}</abbr>`;
  },
};
