/**
 * Shortcode 类型标识。
 *
 * 每个值对应一个用户可插入的自定义标签功能。
 */
export type ShortcodeKind =
  | "abbr"
  | "arrow"
  | "colourFont"
  | "heimu"
  | "hideAndSeekHtml"
  | "hideAndSeekMarkdown"
  | "kidding"
  | "ruby"
  | "tag";

/**
 * Shortcode 字段类型。
 *
 * text 适合短文本，color 会使用颜色输入框，textarea 适合稍长内容，select 适合固定选项。
 */
export type ShortcodeFieldType =
  | "text"
  | "color"
  | "textarea"
  | "select";

/**
 * Shortcode 选择字段选项。
 */
export interface ShortcodeFieldOption {
  /** 选项保存到节点属性中的值。 */
  value: string;
  /** 显示给编辑者看的选项名称。 */
  label: string;
}

/**
 * Shortcode 参数字段定义。
 */
export interface ShortcodeFieldDefinition {
  /** 字段在节点属性中的名称。 */
  name: string;
  /** 显示给编辑者看的字段标签。 */
  label: string;
  /** 字段输入类型。 */
  type: ShortcodeFieldType;
  /** 字段为空时使用的默认值。 */
  defaultValue: string;
  /** 输入框提示文案。 */
  placeholder?: string;
  /** 选择字段可用的固定选项。 */
  options?: ShortcodeFieldOption[];
}

/**
 * Shortcode 节点属性。
 */
export interface ShortcodeAttrs {
  /** 功能类型。 */
  kind: ShortcodeKind;
  /** 普通文本字段。 */
  text?: string;
  /** title 或注音字段。 */
  title?: string;
  /** 颜色字段。 */
  colour?: string;
  /** 文字颜色字段。 */
  textColour?: string;
  /** 标签文本字段。 */
  tag?: string;
  /** 标签预设颜色类型字段。 */
  tagType?: string;
  /** 标签视觉样式字段。 */
  tagEffect?: string;
  /** 隐藏彩蛋内容字段。 */
  content?: string;
  /** 隐藏彩蛋显示后是否使用虚线边框包裹，使用字符串便于写入 data 属性。 */
  dashedBorder?: string;
  /** 箭头方向字段。 */
  direction?: string;
}

/**
 * Shortcode 功能实现定义。
 */
export interface ShortcodeDefinition {
  /** 功能类型。 */
  kind: ShortcodeKind;
  /** 插件设置中控制该功能启用状态的字段名。 */
  settingKey: string;
  /** 编辑器显示标题。 */
  title: string;
  /** 斜杠菜单关键词。 */
  keywords: string[];
  /** 菜单优先级。 */
  priority: number;
  /** 节点是否按块级方式展示。 */
  block: boolean;
  /** 功能参数字段。 */
  fields: ShortcodeFieldDefinition[];
  /** 创建该功能的默认节点属性。 */
  createDefaultAttrs: () => ShortcodeAttrs;
  /** 将节点属性渲染为最终 HTML。 */
  render: (attrs: ShortcodeAttrs) => string;
  /** 将节点属性渲染为编辑器右侧预览 HTML。 */
  renderPreview?: (attrs: ShortcodeAttrs) => string;
}
