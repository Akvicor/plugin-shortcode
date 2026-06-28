<script setup lang="ts">
import { computed, ref } from "vue";
import {
  NodeViewWrapper,
  nodeViewProps,
} from "@halo-dev/richtext-editor";
import { VDropdown } from "@halo-dev/components";
import {
  getShortcodeDefinition,
  renderShortcodeHtml,
} from "../core/registry";
import type { ShortcodeAttrs } from "../core/types";
import ShortcodeFieldControls from "./ShortcodeFieldControls.vue";

/** 当前 NodeView 接收的 Tiptap 属性。 */
const props = defineProps(nodeViewProps);

/** 当前弹出编辑面板是否显示。 */
const showEditor = ref(false);

/** 当前节点的 shortcode 类型定义。 */
const definition = computed(() =>
  getShortcodeDefinition(props.node.attrs.kind)
);

/** 当前节点属性，用于最终效果渲染和字段编辑。 */
const shortcodeAttrs = computed<ShortcodeAttrs>(() => ({
  kind: props.node.attrs.kind,
  text: props.node.attrs.text,
  title: props.node.attrs.title,
  colour: props.node.attrs.colour,
  textColour: props.node.attrs.textColour,
  tag: props.node.attrs.tag,
  tagType: props.node.attrs.tagType,
  tagEffect: props.node.attrs.tagEffect,
  content: props.node.attrs.content,
  dashedBorder: props.node.attrs.dashedBorder,
  direction: props.node.attrs.direction,
}));

/** 正文中直接展示的最终 shortcode HTML。 */
const renderedHtml = computed(() => renderShortcodeHtml(shortcodeAttrs.value));

/**
 * 更新节点属性。
 *
 * @param attrs 需要写入节点的部分属性
 */
function updateAttrs(attrs: Partial<ShortcodeAttrs>) {
  props.updateAttributes(attrs);
}
</script>

<template>
  <node-view-wrapper
    as="span"
    class="shortcode-inline-node"
    :class="{ 'shortcode-inline-node--selected': props.selected }"
    contenteditable="false"
  >
    <VDropdown
      v-model:shown="showEditor"
      :classes="['shortcode-inline-node__dropdown']"
      :distance="8"
      placement="bottom"
    >
      <span
        class="shortcode-inline-node__rendered"
        @click.stop="showEditor = true"
        v-html="renderedHtml"
      />
      <template #popper>
        <div class="shortcode-inline-node__panel">
          <div class="shortcode-inline-node__header">
            {{ definition.title }}
          </div>
          <ShortcodeFieldControls
            :definition="definition"
            :attrs="shortcodeAttrs"
            @update="updateAttrs"
          />
        </div>
      </template>
    </VDropdown>
  </node-view-wrapper>
</template>

<style scoped>
.shortcode-inline-node {
  display: inline-block;
  max-width: 100%;
  margin: 0 2px;
  padding: 0;
  border: 0;
  background: transparent !important;
  vertical-align: baseline;
}

.shortcode-inline-node__rendered {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  cursor: pointer;
  padding: 0;
  border: 0;
  background: transparent !important;
  box-shadow: none !important;
  line-height: inherit;
}

.shortcode-inline-node--selected .shortcode-inline-node__rendered {
  outline: 1px solid #0ea5e9;
  outline-offset: 2px;
}

.shortcode-inline-node__panel {
  width: 320px;
  max-width: min(320px, calc(100vw - 24px));
  padding: 10px;
  background: #fff;
}

.shortcode-inline-node__header {
  margin-bottom: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
}

.shortcode-inline-node__rendered :deep(.heimu),
.shortcode-inline-node__rendered :deep(.heimu a),
.shortcode-inline-node__rendered :deep(a .heimu),
.shortcode-inline-node__rendered :deep(.heimu a.new) {
  background-color: var(--heimu-colour, #000000);
  color: var(--heimu-colour, #000000);
  text-shadow: none;
}

.shortcode-inline-node__rendered :deep(.heimu:hover),
.shortcode-inline-node__rendered :deep(.heimu:active),
.shortcode-inline-node__rendered :deep(.heimu:hover .heimu),
.shortcode-inline-node__rendered :deep(.heimu:active .heimu) {
  color: var(--heimu-reveal-colour, #ffffff) !important;
}

.shortcode-inline-node__rendered :deep(.heimu:hover a),
.shortcode-inline-node__rendered :deep(a:hover .heimu),
.shortcode-inline-node__rendered :deep(.heimu:active a),
.shortcode-inline-node__rendered :deep(a:active .heimu) {
  color: lightblue !important;
}

.shortcode-inline-node__rendered :deep(.heimu:hover .new),
.shortcode-inline-node__rendered :deep(.heimu .new:hover),
.shortcode-inline-node__rendered :deep(.new:hover .heimu),
.shortcode-inline-node__rendered :deep(.heimu:active .new),
.shortcode-inline-node__rendered :deep(.heimu .new:active),
.shortcode-inline-node__rendered :deep(.new:active .heimu) {
  color: #ba0000 !important;
}
</style>
