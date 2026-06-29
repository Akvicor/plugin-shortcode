import type { ShortcodeAttrs, ShortcodeDefinition } from "../core/types";
import { escapeHtml, normalizeColour } from "../core/utils";

/** 标签可选的视觉样式。 */
type TagEffect = "dark" | "light" | "plain";

/** 标签可选的颜色预设。 */
type TagType =
  | "primary"
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "magenta"
  | "red"
  | "volcano"
  | "orange"
  | "gold"
  | "lime"
  | "green"
  | "cyan"
  | "blue"
  | "geekblue"
  | "purple"
  | "custom";

/** 标签默认预设类型。 */
const DEFAULT_TAG_TYPE: TagType = "primary";

/** 标签默认视觉样式。 */
const DEFAULT_TAG_EFFECT: TagEffect = "light";

/** 标签默认文字。 */
const DEFAULT_TAG_TEXT = "标签";

/** 标签默认主色。 */
const DEFAULT_TAG_COLOUR = "#409EFF";

/** 标签浅色和朴素样式的默认文字色。 */
const DEFAULT_TAG_TEXT_COLOUR = DEFAULT_TAG_COLOUR;

/** 标签深色样式的默认文字色。 */
const DEFAULT_DARK_TAG_TEXT_COLOUR = "#FFFFFF";

/** Element Plus light 主题背景色对应主色 light-9，即 90% 白色混合。 */
const TAG_LIGHT_BACKGROUND_WHITE_RATIO = 0.9;

/** Element Plus light 主题边框色对应主色 light-8，即 80% 白色混合。 */
const TAG_LIGHT_BORDER_WHITE_RATIO = 0.8;

/** Element Plus plain 主题边框色对应主色 light-5，即 50% 白色混合。 */
const TAG_PLAIN_BORDER_WHITE_RATIO = 0.5;

/** 标签预设颜色。 */
const TAG_TYPE_COLOURS: Record<TagType, string> = {
  primary: "#409EFF",
  success: "#67C23A",
  info: "#909399",
  warning: "#E6A23C",
  danger: "#F56C6C",
  magenta: "#eb2f96",
  red: "#f5222d",
  volcano: "#fa541c",
  orange: "#fa8c16",
  gold: "#faad14",
  lime: "#a0d911",
  green: "#52c41a",
  cyan: "#13c2c2",
  blue: "#1677ff",
  geekblue: "#2f54eb",
  purple: "#722ed1",
  custom: DEFAULT_TAG_COLOUR,
};

/** 标签预设选项。 */
const TAG_TYPE_OPTIONS = [
  { value: "primary", label: "Primary" },
  { value: "success", label: "Success" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "danger", label: "Danger" },
  { value: "magenta", label: "Magenta" },
  { value: "red", label: "Red" },
  { value: "volcano", label: "Volcano" },
  { value: "orange", label: "Orange" },
  { value: "gold", label: "Gold" },
  { value: "lime", label: "Lime" },
  { value: "green", label: "Green" },
  { value: "cyan", label: "Cyan" },
  { value: "blue", label: "Blue" },
  { value: "geekblue", label: "Geekblue" },
  { value: "purple", label: "Purple" },
  { value: "custom", label: "Custom" },
];

/** 标签样式选项。 */
const TAG_EFFECT_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "plain", label: "Plain" },
];

/**
 * 判断标签样式是否是当前支持的样式。
 *
 * @param value 待判断的标签样式
 * @returns 是否是支持的标签样式
 */
function isTagEffect(value: string | undefined): value is TagEffect {
  return value === "dark" || value === "light" || value === "plain";
}

/**
 * 判断标签预设是否是当前支持的预设。
 *
 * @param value 待判断的标签预设
 * @returns 是否是支持的标签预设
 */
function isTagType(value: string | undefined): value is TagType {
  return !!value && Object.prototype.hasOwnProperty.call(TAG_TYPE_COLOURS, value);
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
 * 将颜色通道限制在 0 到 255 之间。
 *
 * @param value 待限制的颜色通道
 * @returns 可安全写入十六进制颜色的颜色通道
 */
function clampColourChannel(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

/**
 * 将颜色通道转换为两位十六进制字符串。
 *
 * @param value 颜色通道值
 * @returns 两位十六进制字符串
 */
function toHexChannel(value: number): string {
  return clampColourChannel(value).toString(16).padStart(2, "0");
}

/**
 * 将主色与白色按比例混合。
 *
 * @param colour 主色
 * @param whiteRatio 白色占比，0 到 1
 * @returns 混合后的十六进制颜色
 */
function mixWithWhite(colour: string, whiteRatio: number): string {
  const hex = expandHexColour(colour);
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const baseRatio = 1 - whiteRatio;
  return `#${toHexChannel(red * baseRatio + 255 * whiteRatio)}${toHexChannel(
    green * baseRatio + 255 * whiteRatio
  )}${toHexChannel(blue * baseRatio + 255 * whiteRatio)}`;
}

/**
 * 按标签预设和自定义颜色取最终主色。
 *
 * @param attrs shortcode 节点属性
 * @param tagType 标签预设类型
 * @returns 标签最终主色
 */
function getTagMainColour(attrs: ShortcodeAttrs, tagType: TagType): string {
  if (tagType === "custom") {
    return normalizeColour(attrs.colour, DEFAULT_TAG_COLOUR);
  }
  return TAG_TYPE_COLOURS[tagType];
}

/**
 * 按标签样式取默认文字色。
 *
 * @param effect 标签视觉样式
 * @param mainColour 标签主色
 * @returns 默认文字色
 */
function getDefaultTextColour(effect: TagEffect, mainColour: string): string {
  if (effect === "dark") {
    return DEFAULT_DARK_TAG_TEXT_COLOUR;
  }
  return mainColour;
}

/**
 * 按标签样式生成最终颜色。
 *
 * @param effect 标签视觉样式
 * @param mainColour 标签主色
 * @returns 标签背景色、边框色和文字色默认值
 */
function getTagEffectColours(effect: TagEffect, mainColour: string) {
  if (effect === "dark") {
    return {
      backgroundColour: mainColour,
      borderColour: mainColour,
      defaultTextColour: getDefaultTextColour(effect, mainColour),
    };
  }

  if (effect === "plain") {
    return {
      backgroundColour: "#FFFFFF",
      borderColour: mixWithWhite(mainColour, TAG_PLAIN_BORDER_WHITE_RATIO),
      defaultTextColour: getDefaultTextColour(effect, mainColour),
    };
  }

  return {
    backgroundColour: mixWithWhite(mainColour, TAG_LIGHT_BACKGROUND_WHITE_RATIO),
    borderColour: mixWithWhite(mainColour, TAG_LIGHT_BORDER_WHITE_RATIO),
    defaultTextColour: getDefaultTextColour(effect, mainColour),
  };
}

/**
 * 标签 shortcode 实现。
 */
export const tagShortcode: ShortcodeDefinition = {
  kind: "tag",
  settingKey: "enable_tag",
  title: "标签",
  keywords: ["tag", "biaoqian", "shortcode"],
  priority: 126,
  block: false,
  fields: [
    {
      name: "tag",
      label: "标签",
      type: "text",
      defaultValue: DEFAULT_TAG_TEXT,
    },
    {
      name: "tagEffect",
      label: "样式",
      type: "select",
      defaultValue: DEFAULT_TAG_EFFECT,
      options: TAG_EFFECT_OPTIONS,
    },
    {
      name: "tagType",
      label: "预设",
      type: "select",
      defaultValue: DEFAULT_TAG_TYPE,
      options: TAG_TYPE_OPTIONS,
    },
    {
      name: "colour",
      label: "背景颜色",
      type: "color",
      defaultValue: DEFAULT_TAG_COLOUR,
    },
    {
      name: "textColour",
      label: "文字颜色",
      type: "color",
      defaultValue: DEFAULT_TAG_TEXT_COLOUR,
    },
  ],
  createDefaultAttrs() {
    return {
      kind: "tag",
      tag: DEFAULT_TAG_TEXT,
      colour: DEFAULT_TAG_COLOUR,
      textColour: DEFAULT_TAG_TEXT_COLOUR,
      tagType: DEFAULT_TAG_TYPE,
      tagEffect: DEFAULT_TAG_EFFECT,
    };
  },
  render(attrs: ShortcodeAttrs) {
    /** 当前标签最终使用的视觉样式。 */
    const effect = isTagEffect(attrs.tagEffect)
      ? attrs.tagEffect
      : DEFAULT_TAG_EFFECT;
    /** 当前标签最终使用的颜色预设。 */
    const tagType = isTagType(attrs.tagType) ? attrs.tagType : DEFAULT_TAG_TYPE;
    /** 当前标签最终使用的主色。 */
    const mainColour = getTagMainColour(attrs, tagType);
    /** 当前标签最终使用的视觉颜色组。 */
    const effectColours = getTagEffectColours(effect, mainColour);
    /** 用户保存的文字色，默认主色视为未手动覆盖，方便 dark 样式自动使用白字。 */
    const storedTextColour = normalizeColour(
      attrs.textColour,
      DEFAULT_TAG_TEXT_COLOUR
    );
    /** 当前标签文字最终使用的颜色。 */
    const textColour =
      storedTextColour === DEFAULT_TAG_TEXT_COLOUR
        ? effectColours.defaultTextColour
        : storedTextColour;

    return `<span class="shortcode-tag" style="display: inline-flex;align-items: center;vertical-align: baseline;max-width: 100%;padding: 0.08em 0.5em;border: 1px solid ${escapeHtml(
      effectColours.borderColour
    )};border-radius: 4px;background-color: ${escapeHtml(
      effectColours.backgroundColour
    )};color: ${escapeHtml(
      textColour
    )};font-size: 0.82em;font-weight: 500;line-height: 1.35;white-space: nowrap;text-decoration: none;background-clip: padding-box;">${escapeHtml(
      attrs.tag
    )}</span>`;
  },
};
