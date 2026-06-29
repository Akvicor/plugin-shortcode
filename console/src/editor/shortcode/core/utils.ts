/**
 * 将 HTML 字符串中的特殊字符转义为安全文本。
 *
 * @param value 原始文本
 * @returns 转义后的文本
 */
export function escapeHtml(value: string | undefined): string {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * 规范化颜色值。
 *
 * @param value 用户输入或解析得到的颜色
 * @param fallback 兜底颜色
 * @returns 可以安全写入 style/color 属性的颜色值
 */
export function normalizeColour(
  value: string | undefined,
  fallback = "#3498DB"
): string {
  const colour = (value || "").trim();
  if (/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(colour)) {
    return colour;
  }
  return fallback;
}

/**
 * 从 data-shortcode-* 属性中读取通用节点属性。
 *
 * @param element 带有 data-shortcode-kind 的 HTML 元素
 * @returns 从 data 属性还原出的节点属性
 */
export function parseStoredAttrs(element: HTMLElement) {
  return {
    kind: element.dataset.shortcodeKind,
    text: element.dataset.shortcodeText || "",
    title: element.dataset.shortcodeTitle || "",
    colour: element.dataset.shortcodeColour || "",
    textColour: element.dataset.shortcodeTextColour || "",
    tag: element.dataset.shortcodeTag || "",
    tagType: element.dataset.shortcodeTagType || "",
    tagEffect: element.dataset.shortcodeTagEffect || "",
    content: element.dataset.shortcodeContent || "",
    dashedBorder: element.dataset.shortcodeDashedBorder || "",
  };
}
