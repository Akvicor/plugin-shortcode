import type { ShortcodeAttrs, ShortcodeDefinition } from "../core/types";
import { escapeHtml, normalizeColour } from "../core/utils";

/** 黑幕遮盖色的默认值。 */
const DEFAULT_HEIMU_COLOUR = "#000000";

/** 浅色遮盖背景解除隐藏后使用的黑色文字。 */
const DARK_REVEAL_TEXT_COLOUR = "#000000";

/** 深色遮盖背景解除隐藏后使用的白色文字。 */
const LIGHT_REVEAL_TEXT_COLOUR = "#FFFFFF";

/**
 * 将十六进制颜色通道转换为线性 RGB 通道。
 *
 * @param value 0 到 255 的 sRGB 通道值
 * @returns 线性 RGB 通道值
 */
function toLinearRgbChannel(value: number): number {
  const channel = value / 255;
  return channel <= 0.03928
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

/**
 * 将 #RGB 或 #RRGGBB 颜色展开为 6 位十六进制颜色。
 *
 * @param colour 已通过 normalizeColour 规范化的十六进制颜色
 * @returns 不带 # 的 6 位十六进制颜色
 */
function expandHexColour(colour: string): string {
  const hex = colour.slice(1);
  if (hex.length === 3) {
    return hex
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }
  return hex;
}

/**
 * 计算十六进制颜色的 WCAG 相对亮度。
 *
 * @param colour 已通过 normalizeColour 规范化的十六进制颜色
 * @returns 0 到 1 之间的相对亮度
 */
function getRelativeLuminance(colour: string): number {
  const hex = expandHexColour(colour);
  const red = toLinearRgbChannel(Number.parseInt(hex.slice(0, 2), 16));
  const green = toLinearRgbChannel(Number.parseInt(hex.slice(2, 4), 16));
  const blue = toLinearRgbChannel(Number.parseInt(hex.slice(4, 6), 16));
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

/**
 * 计算两个相对亮度之间的 WCAG 对比度。
 *
 * @param firstLuminance 第一个颜色的相对亮度
 * @param secondLuminance 第二个颜色的相对亮度
 * @returns 两个颜色之间的对比度
 */
function getContrastRatio(
  firstLuminance: number,
  secondLuminance: number
): number {
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 根据遮盖色对比度选择解除隐藏后的文字颜色。
 *
 * @param colour 已通过 normalizeColour 规范化的遮盖色
 * @returns 适合叠在遮盖色上的文字颜色
 */
function getRevealTextColour(colour: string): string {
  const backgroundLuminance = getRelativeLuminance(colour);
  const darkTextContrast = getContrastRatio(
    getRelativeLuminance(DARK_REVEAL_TEXT_COLOUR),
    backgroundLuminance
  );
  const lightTextContrast = getContrastRatio(
    getRelativeLuminance(LIGHT_REVEAL_TEXT_COLOUR),
    backgroundLuminance
  );
  return darkTextContrast >= lightTextContrast
    ? DARK_REVEAL_TEXT_COLOUR
    : LIGHT_REVEAL_TEXT_COLOUR;
}

/**
 * 黑幕标签实现。
 */
export const heimuShortcode: ShortcodeDefinition = {
  kind: "heimu",
  settingKey: "enable_heimu",
  title: "黑幕",
  keywords: ["heimu", "spoiler", "heimu", "shortcode"],
  priority: 123,
  block: false,
  fields: [
    {
      name: "text",
      label: "文本",
      type: "text",
      defaultValue: "黑幕内容",
    },
    {
      name: "title",
      label: "提示",
      type: "text",
      defaultValue: "你知道得太多了",
    },
    {
      name: "colour",
      label: "颜色",
      type: "color",
      defaultValue: DEFAULT_HEIMU_COLOUR,
    },
  ],
  createDefaultAttrs() {
    return {
      kind: "heimu",
      text: "黑幕内容",
      title: "你知道得太多了",
      colour: DEFAULT_HEIMU_COLOUR,
    };
  },
  render(attrs: ShortcodeAttrs) {
    /** 当前黑幕节点最终写入 CSS 变量的遮盖色。 */
    const colour = normalizeColour(attrs.colour, DEFAULT_HEIMU_COLOUR);
    /** 当前黑幕节点解除隐藏时使用的可读文字色。 */
    const revealColour = getRevealTextColour(colour);
    return `<span class="heimu" style="--heimu-colour: ${escapeHtml(
      colour
    )}; --heimu-reveal-colour: ${escapeHtml(revealColour)};" title="${escapeHtml(
      attrs.title
    )}">${escapeHtml(attrs.text)}</span>`;
  },
};
