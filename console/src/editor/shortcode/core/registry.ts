import type {
  ShortcodeAttrs,
  ShortcodeDefinition,
  ShortcodeKind,
} from "./types";
import { parseStoredAttrs } from "./utils";
import { abbrShortcode } from "../tags/abbr";
import { heimuShortcode } from "../tags/heimu";
import {
  hideAndSeekHtmlShortcode,
  hideAndSeekMarkdownShortcode,
} from "../tags/hide-and-seek";
import { kiddingShortcode } from "../tags/kidding";
import { rubyShortcode } from "../tags/ruby";
import { tagShortcode } from "../tags/tag";

/**
 * Shortcode 功能注册表。
 *
 * 新增或删除标签时，优先调整 tags/ 下的实现文件和这里的注册列表。
 */
export const SHORTCODE_DEFINITIONS: ShortcodeDefinition[] = [
  abbrShortcode,
  heimuShortcode,
  kiddingShortcode,
  rubyShortcode,
  tagShortcode,
  hideAndSeekMarkdownShortcode,
  hideAndSeekHtmlShortcode,
];

/**
 * 根据 shortcode 类型读取定义。
 *
 * @param kind shortcode 类型
 * @returns 匹配的功能定义
 */
export function getShortcodeDefinition(kind: ShortcodeKind): ShortcodeDefinition {
  const definition = SHORTCODE_DEFINITIONS.find((item) => item.kind === kind);
  return definition || SHORTCODE_DEFINITIONS[0];
}

/**
 * 获取 shortcode 类型的默认属性。
 *
 * @param kind shortcode 类型
 * @returns 可以直接写入 Tiptap 节点的默认属性
 */
export function createDefaultAttrs(kind: ShortcodeKind): ShortcodeAttrs {
  return getShortcodeDefinition(kind).createDefaultAttrs();
}

/**
 * 根据节点属性生成最终 HTML。
 *
 * @param attrs shortcode 节点属性
 * @returns 与 references/shortcodes 对应的 HTML 片段
 */
export function renderShortcodeHtml(attrs: ShortcodeAttrs): string {
  return getShortcodeDefinition(attrs.kind).render(attrs);
}

/**
 * 将最终 HTML 片段创建成 DOM 节点。
 *
 * @param attrs shortcode 节点属性
 * @returns 用于 Tiptap 序列化的 DOM 节点
 */
export function createShortcodeDom(attrs: ShortcodeAttrs): HTMLElement {
  const definition = getShortcodeDefinition(attrs.kind);
  const template = document.createElement("template");
  template.innerHTML = renderShortcodeHtml(attrs).trim();
  const element = template.content.firstElementChild as HTMLElement | null;
  const dom = element || document.createElement(definition.block ? "div" : "span");

  dom.setAttribute("data-shortcode-kind", attrs.kind);
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      /** data-* 属性使用短横线命名，保证驼峰字段可被 dataset 正确还原。 */
      const dataKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      dom.setAttribute(`data-shortcode-${dataKey}`, String(value));
    }
  });

  return dom;
}

/**
 * 从 HTML 元素解析 shortcode 节点属性。
 *
 * @param element 由 Tiptap 传入的带 data-shortcode-kind 的 HTML 元素
 * @returns shortcode 节点属性
 */
export function parseShortcodeAttrs(element: HTMLElement): ShortcodeAttrs {
  const storedAttrs = parseStoredAttrs(element);
  return {
    kind: element.dataset.shortcodeKind as ShortcodeKind,
    text: storedAttrs.text,
    title: storedAttrs.title,
    colour: storedAttrs.colour,
    textColour: storedAttrs.textColour,
    tag: storedAttrs.tag,
    tagType: storedAttrs.tagType,
    tagEffect: storedAttrs.tagEffect,
    content: storedAttrs.content,
    dashedBorder: storedAttrs.dashedBorder,
  };
}
