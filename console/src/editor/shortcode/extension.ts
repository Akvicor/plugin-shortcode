import {
  Node,
  ToolboxItem,
  VueNodeViewRenderer,
  type Editor,
  type ExtensionOptions,
  type Range,
} from "@halo-dev/richtext-editor";
import { markRaw } from "vue";
import TablerCodeDots from "~icons/tabler/code-dots";
import HideAndSeekNodeView from "./components/HideAndSeekNodeView.vue";
import InlineShortcodeNodeView from "./components/InlineShortcodeNodeView.vue";
import {
  createDefaultAttrs,
  getShortcodeDefinition,
} from "./core/registry";
import {
  createShortcodeDom,
  parseShortcodeAttrs,
} from "./core/registry";
import type { ShortcodeAttrs, ShortcodeKind } from "./core/types";
import { ARROW_DIRECTIONS } from "./tags/arrow";
import { getEnabledShortcodeDefinitions } from "./setting";

/**
 * 插入命令上下文。
 *
 * 这里只使用 Tiptap commands.insertContent 能力，因此不需要把完整命令上下文
 * 引入为额外依赖类型。
 */
interface InsertShortcodeCommandContext {
  /** Tiptap 命令集合。 */
  commands: {
    /** 向当前编辑器插入内容。 */
    insertContent: (content: unknown) => boolean;
  };
}

declare module "@halo-dev/richtext-editor" {
  interface Commands<ReturnType> {
    shortcode: {
      insertShortcode: (kind: ShortcodeKind) => ReturnType;
    };
  }
}

/**
 * 创建 shortcode 节点的通用属性定义。
 *
 * @returns Tiptap 节点属性配置
 */
function createShortcodeAttributes() {
  return {
    kind: {
      default: "abbr",
      rendered: false,
      parseHTML: (element: HTMLElement) => parseShortcodeAttrs(element).kind,
    },
    text: {
      default: "",
      rendered: false,
      parseHTML: (element: HTMLElement) => parseShortcodeAttrs(element).text || "",
    },
    title: {
      default: "",
      rendered: false,
      parseHTML: (element: HTMLElement) =>
        parseShortcodeAttrs(element).title || "",
    },
    colour: {
      default: "#3498DB",
      rendered: false,
      parseHTML: (element: HTMLElement) => {
        /** 当前 HTML 元素解析得到的 shortcode 属性。 */
        const attrs = parseShortcodeAttrs(element);
        /** 当前 shortcode 定义中声明的颜色字段。 */
        const colourField = getShortcodeDefinition(attrs.kind).fields.find(
          (field) => field.name === "colour"
        );
        return attrs.colour || colourField?.defaultValue || "#3498DB";
      },
    },
    textColour: {
      default: "#111111",
      rendered: false,
      parseHTML: (element: HTMLElement) => {
        /** 当前 HTML 元素解析得到的 shortcode 属性。 */
        const attrs = parseShortcodeAttrs(element);
        /** 当前 shortcode 定义中声明的文字颜色字段。 */
        const textColourField = getShortcodeDefinition(attrs.kind).fields.find(
          (field) => field.name === "textColour"
        );
        return attrs.textColour || textColourField?.defaultValue || "#111111";
      },
    },
    tag: {
      default: "",
      rendered: false,
      parseHTML: (element: HTMLElement) => parseShortcodeAttrs(element).tag || "",
    },
    tagType: {
      default: "primary",
      rendered: false,
      parseHTML: (element: HTMLElement) =>
        parseShortcodeAttrs(element).tagType || "primary",
    },
    tagEffect: {
      default: "light",
      rendered: false,
      parseHTML: (element: HTMLElement) =>
        parseShortcodeAttrs(element).tagEffect || "light",
    },
    content: {
      default: "",
      rendered: false,
      parseHTML: (element: HTMLElement) =>
        parseShortcodeAttrs(element).content || "",
    },
    dashedBorder: {
      default: "false",
      rendered: false,
      parseHTML: (element: HTMLElement) =>
        parseShortcodeAttrs(element).dashedBorder || "false",
    },
    direction: {
      default: ARROW_DIRECTIONS[0].value,
      rendered: false,
      parseHTML: (element: HTMLElement) =>
        parseShortcodeAttrs(element).direction || ARROW_DIRECTIONS[0].value,
    },
  };
}

/**
 * 创建 shortcode 菜单项。
 *
 * @param editor 当前编辑器实例
 * @returns toolbox 菜单项列表
 */
function createShortcodeToolboxItems(editor: Editor) {
  return getEnabledShortcodeDefinitions().map((definition) => ({
    priority: definition.priority,
    component: markRaw(ToolboxItem),
    props: {
      editor,
      icon: markRaw(TablerCodeDots),
      title: definition.title,
      action: () => {
        editor.chain().focus().insertShortcode(definition.kind).run();
      },
    },
  }));
}

/**
 * 创建 shortcode 命令菜单项。
 *
 * @returns 命令菜单项列表
 */
function createShortcodeCommandMenuItems() {
  return getEnabledShortcodeDefinitions().map((definition) => ({
    priority: definition.priority,
    icon: markRaw(TablerCodeDots),
    title: definition.title,
    keywords: definition.keywords,
    command: ({ editor, range }: { editor: Editor; range: Range }) => {
      editor.chain().focus().deleteRange(range).insertShortcode(definition.kind).run();
    },
  }));
}

/**
 * 判断 shortcode kind 是否应使用块级节点。
 *
 * @param kind shortcode 类型
 * @returns 是否是块级 shortcode
 */
function isBlockShortcodeKind(kind: ShortcodeKind): boolean {
  return getShortcodeDefinition(kind).block;
}

/**
 * Halo 默认编辑器行内 Shortcode 扩展。
 */
const InlineShortcodeExtension = Node.create<ExtensionOptions>({
  name: "shortcodeInline",

  priority: 1000,

  group: "inline",

  inline: true,

  atom: true,

  /** 行内 shortcode 是完整原子节点，不允许粗体、删除线、颜色等 mark 包裹节点外层。 */
  marks: "",

  selectable: true,

  draggable: false,

  addAttributes() {
    return createShortcodeAttributes();
  },

  addOptions() {
    return {
      ...this.parent?.(),
      getToolboxItems({ editor }: { editor: Editor }) {
        return createShortcodeToolboxItems(editor);
      },
      getCommandMenuItems() {
        return createShortcodeCommandMenuItems();
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "[data-shortcode-kind]",
        getAttrs: (element) => {
          /** 只让行内扩展接管普通 shortcode，隐藏彩蛋由块级扩展接管。 */
          const kind = parseShortcodeAttrs(element as HTMLElement).kind;
          return isBlockShortcodeKind(kind) ? false : null;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs as ShortcodeAttrs;
    void HTMLAttributes;
    return {
      dom: createShortcodeDom(attrs),
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(InlineShortcodeNodeView);
  },

  addCommands() {
    return {
      insertShortcode:
        (kind: ShortcodeKind) =>
        ({ commands }: InsertShortcodeCommandContext) => {
          return commands.insertContent({
            type: isBlockShortcodeKind(kind)
              ? "shortcodeBlock"
              : "shortcodeInline",
            attrs: createDefaultAttrs(kind),
          });
        },
    };
  },
});

/**
 * Halo 默认编辑器块级 Shortcode 扩展。
 */
const BlockShortcodeExtension = Node.create<ExtensionOptions>({
  name: "shortcodeBlock",

  priority: 999,

  group: "block",

  atom: true,

  selectable: true,

  draggable: false,

  addAttributes() {
    return createShortcodeAttributes();
  },

  parseHTML() {
    return [
      {
        tag: "[data-shortcode-kind]",
        getAttrs: (element) => {
          /** 只让块级扩展接管隐藏彩蛋，普通 shortcode 仍由行内扩展接管。 */
          const kind = parseShortcodeAttrs(element as HTMLElement).kind;
          return isBlockShortcodeKind(kind) ? null : false;
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs as ShortcodeAttrs;
    void HTMLAttributes;
    return {
      dom: createShortcodeDom(attrs),
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(HideAndSeekNodeView);
  },

});

/** Halo 默认编辑器 Shortcode 扩展列表。 */
export const ShortcodeExtensions = [
  InlineShortcodeExtension,
  BlockShortcodeExtension,
];
