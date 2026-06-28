import { marked } from "marked";

import type { ShortcodeAttrs, ShortcodeDefinition } from "../core/types";

/** 隐藏彩蛋 shortcode 在文章 HTML 中使用的外层类名，前台样式和脚本依赖这个类名查找节点。 */
const HIDE_AND_SEEK_CONTAINER_CLASS = "shortcode-hide-and-seek";

/** 隐藏彩蛋显示后使用虚线边框包裹内容的修饰类名。 */
const HIDE_AND_SEEK_DASHED_BORDER_CLASS =
  "shortcode-hide-and-seek--dashed-border";

/** 隐藏彩蛋编辑器字段的默认内容。 */
const DEFAULT_HIDE_AND_SEEK_CONTENT = "隐藏内容";

/** 隐藏彩蛋默认不显示虚线边框。 */
const DEFAULT_HIDE_AND_SEEK_DASHED_BORDER = "false";

/**
 * 将已渲染的隐藏内容包裹为前台隐藏彩蛋容器。
 *
 * @param content 已经转换好的 HTML 内容
 * @param dashedBorder 是否在显示后用虚线边框包裹
 * @returns 带有隐藏彩蛋类名的块级 HTML
 */
function renderHideAndSeekTag(content: string, dashedBorder: string | undefined): string {
  /** 当前隐藏彩蛋外层节点需要写入的 class 列表。 */
  const className =
    dashedBorder === "true"
      ? `${HIDE_AND_SEEK_CONTAINER_CLASS} ${HIDE_AND_SEEK_DASHED_BORDER_CLASS}`
      : HIDE_AND_SEEK_CONTAINER_CLASS;
  return `<div class="${className}">${content}</div>`;
}

/**
 * 将 Markdown 隐藏内容转换为 HTML。
 *
 * @param content 用户输入的 Markdown 原文
 * @returns 可以直接写入隐藏彩蛋容器的 HTML
 */
function renderMarkdownContent(content: string): string {
  return marked.parse(content, { async: false });
}

/**
 * Markdown 隐藏彩蛋标签定义。
 *
 * 该标签保存 Markdown 原文，编辑器预览和最终文章输出都会在客户端先转换为 HTML。
 */
export const hideAndSeekMarkdownShortcode: ShortcodeDefinition = {
  kind: "hideAndSeekMarkdown",
  settingKey: "enable_hide_and_seek",
  title: "隐藏彩蛋 Markdown",
  keywords: ["hide", "seek", "caidan", "markdown", "shortcode"],
  priority: 127,
  block: true,
  fields: [
    {
      name: "content",
      label: "隐藏内容",
      type: "textarea",
      defaultValue: DEFAULT_HIDE_AND_SEEK_CONTENT,
      placeholder: "输入 Markdown 内容",
    },
  ],
  createDefaultAttrs() {
    return {
      kind: "hideAndSeekMarkdown",
      content: DEFAULT_HIDE_AND_SEEK_CONTENT,
      dashedBorder: DEFAULT_HIDE_AND_SEEK_DASHED_BORDER,
    };
  },
  render(attrs: ShortcodeAttrs) {
    return renderHideAndSeekTag(
      renderMarkdownContent(attrs.content || ""),
      attrs.dashedBorder
    );
  },
  renderPreview(attrs: ShortcodeAttrs) {
    return renderMarkdownContent(attrs.content || "");
  },
};

/**
 * HTML 隐藏彩蛋标签定义。
 *
 * 该标签保存 HTML 原文，编辑器预览和最终文章输出都会按原 HTML 输出。
 */
export const hideAndSeekHtmlShortcode: ShortcodeDefinition = {
  kind: "hideAndSeekHtml",
  settingKey: "enable_hide_and_seek",
  title: "隐藏彩蛋 HTML",
  keywords: ["hide", "seek", "caidan", "html", "shortcode"],
  priority: 126,
  block: true,
  fields: [
    {
      name: "content",
      label: "隐藏内容",
      type: "textarea",
      defaultValue: DEFAULT_HIDE_AND_SEEK_CONTENT,
      placeholder: "输入 HTML 内容",
    },
  ],
  createDefaultAttrs() {
    return {
      kind: "hideAndSeekHtml",
      content: DEFAULT_HIDE_AND_SEEK_CONTENT,
      dashedBorder: DEFAULT_HIDE_AND_SEEK_DASHED_BORDER,
    };
  },
  render(attrs: ShortcodeAttrs) {
    return renderHideAndSeekTag(attrs.content || "", attrs.dashedBorder);
  },
  renderPreview(attrs: ShortcodeAttrs) {
    return attrs.content || "";
  },
};
