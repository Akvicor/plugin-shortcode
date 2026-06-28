import type { ShortcodeAttrs, ShortcodeDefinition } from "../core/types";
import { escapeHtml, normalizeColour } from "../core/utils";

/**
 * 彩色文字标签实现。
 */
export const colourFontShortcode: ShortcodeDefinition = {
  kind: "colourFont",
  settingKey: "enable_colour_font",
  title: "彩色文字",
  keywords: ["colour", "color", "wenzi", "shortcode"],
  priority: 122,
  block: false,
  fields: [
    {
      name: "text",
      label: "文本",
      type: "text",
      defaultValue: "彩色文字",
    },
    {
      name: "colour",
      label: "颜色",
      type: "color",
      defaultValue: "#3498DB",
    },
  ],
  createDefaultAttrs() {
    return {
      kind: "colourFont",
      text: "彩色文字",
      colour: "#3498DB",
    };
  },
  render(attrs: ShortcodeAttrs) {
    return `<font color="${escapeHtml(
      normalizeColour(attrs.colour)
    )}">${escapeHtml(attrs.text)}</font>`;
  },
};
