import type { ShortcodeAttrs, ShortcodeDefinition } from "../core/types";
import { escapeHtml, normalizeColour } from "../core/utils";

/**
 * 箭头方向标识。
 */
export type ArrowDirection = "rightThin" | "right" | "down" | "left" | "up";

/**
 * 箭头方向定义。
 */
export interface ArrowDirectionDefinition {
  /** 方向标识。 */
  value: ArrowDirection;
  /** 方向在编辑器内的显示名称。 */
  label: string;
  /** 方向对应的最终 HTML 符号。 */
  symbol: string;
  /** 参考 shortcode 中的默认颜色。 */
  defaultColour: string;
}

/**
 * 箭头方向列表。
 *
 * 默认值来自 references/shortcodes 中的各个 arrow HTML。
 */
export const ARROW_DIRECTIONS: ArrowDirectionDefinition[] = [
  {
    value: "rightThin",
    label: "右箭头 ➤",
    symbol: "➤",
    defaultColour: "#9B59B6",
  },
  {
    value: "right",
    label: "右箭头 ⮞",
    symbol: "⮞",
    defaultColour: "#3498DB",
  },
  {
    value: "down",
    label: "下箭头 ⮟",
    symbol: "⮟",
    defaultColour: "#2ECC71",
  },
  {
    value: "left",
    label: "左箭头 ⮜",
    symbol: "⮜",
    defaultColour: "#9B59B6",
  },
  {
    value: "up",
    label: "上箭头 ⮝",
    symbol: "⮝",
    defaultColour: "#E74C3C",
  },
];

/**
 * 根据箭头方向读取定义。
 *
 * @param value 箭头方向
 * @returns 匹配的箭头方向定义
 */
export function getArrowDirection(
  value: string | undefined
): ArrowDirectionDefinition {
  return (
    ARROW_DIRECTIONS.find((item) => item.value === value) ||
    ARROW_DIRECTIONS[0]
  );
}

/**
 * 箭头标签实现。
 */
export const arrowShortcode: ShortcodeDefinition = {
  kind: "arrow",
  settingKey: "enable_arrow",
  title: "箭头",
  keywords: ["arrow", "jiantou", "shortcode"],
  priority: 121,
  block: false,
  fields: [
    {
      name: "colour",
      label: "颜色",
      type: "color",
      defaultValue: ARROW_DIRECTIONS[0].defaultColour,
    },
  ],
  createDefaultAttrs() {
    return {
      kind: "arrow",
      direction: ARROW_DIRECTIONS[0].value,
      colour: ARROW_DIRECTIONS[0].defaultColour,
    };
  },
  render(attrs: ShortcodeAttrs) {
    const direction = getArrowDirection(attrs.direction);
    const colour = normalizeColour(attrs.colour, direction.defaultColour);
    return `<font color="${escapeHtml(colour)}">${direction.symbol}</font>`;
  },
};
