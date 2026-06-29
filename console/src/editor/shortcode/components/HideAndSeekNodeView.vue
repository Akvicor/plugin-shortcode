<script setup lang="ts">
import { computed } from "vue";
import {
  NodeViewWrapper,
  nodeViewProps,
} from "@halo-dev/richtext-editor";
import {
  getShortcodeDefinition,
  renderShortcodeHtml,
} from "../core/registry";
import type { ShortcodeAttrs } from "../core/types";
import ShortcodeFieldControls from "./ShortcodeFieldControls.vue";

/** 当前 NodeView 接收的 Tiptap 属性。 */
const props = defineProps(nodeViewProps);

/** 当前隐藏彩蛋 shortcode 定义。 */
const definition = computed(() =>
  getShortcodeDefinition(props.node.attrs.kind)
);

/** 当前节点属性，用于字段编辑和右侧预览。 */
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
}));

/** 右侧预览只展示隐藏内容，不展示外层隐藏容器。 */
const previewHtml = computed(() => {
  if (definition.value.renderPreview) {
    return definition.value.renderPreview(shortcodeAttrs.value);
  }
  return renderShortcodeHtml(shortcodeAttrs.value);
});

/** 右侧预览是否展示隐藏内容显示后的虚线包裹效果。 */
const previewHasDashedBorder = computed(
  () => shortcodeAttrs.value.dashedBorder === "true"
);

/**
 * 切换隐藏内容显示后的虚线包裹效果。
 *
 * @param event 勾选变化事件
 */
function updateDashedBorder(event: Event) {
  const target = event.target as HTMLInputElement;
  updateAttrs({
    dashedBorder: target.checked ? "true" : "false",
  });
}

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
    as="div"
    class="shortcode-hide-node"
    :class="{ 'shortcode-hide-node--selected': props.selected }"
    contenteditable="false"
  >
    <div class="shortcode-hide-node__header">
      <span class="shortcode-hide-node__title">
        {{ definition.title }}
      </span>
      <label class="shortcode-hide-node__option">
        <input
          class="shortcode-hide-node__checkbox"
          type="checkbox"
          :checked="previewHasDashedBorder"
          @change="updateDashedBorder"
        />
        <span class="shortcode-hide-node__option-text">显示后虚线包裹</span>
      </label>
    </div>
    <div class="shortcode-hide-node__body">
      <ShortcodeFieldControls
        class="shortcode-hide-node__editor"
        :definition="definition"
        :attrs="shortcodeAttrs"
        :block="true"
        :hide-labels="true"
        @update="updateAttrs"
      />
      <div
        class="shortcode-hide-node__preview"
        :class="{
          'shortcode-hide-node__preview--dashed-border': previewHasDashedBorder,
        }"
        v-html="previewHtml"
      />
    </div>
  </node-view-wrapper>
</template>

<style scoped>
.shortcode-hide-node {
  display: grid;
  gap: 8px;
  max-width: 100%;
  margin: 8px 0;
  padding: 8px;
  border: 1px solid #d7dde7;
  border-radius: 4px;
  background: #f8fafc;
}

.shortcode-hide-node--selected {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 1px rgba(14, 165, 233, 0.2);
}

.shortcode-hide-node__header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  column-gap: 18px;
  row-gap: 6px;
  min-width: 0;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
}

.shortcode-hide-node__title {
  min-width: 0;
}

.shortcode-hide-node__option {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  padding-top: 1px;
  color: #475569;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
}

.shortcode-hide-node__checkbox {
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: #0ea5e9;
}

.shortcode-hide-node__option-text {
  white-space: nowrap;
}

.shortcode-hide-node__body {
  display: grid;
  grid-template-columns: minmax(280px, 0.95fr) minmax(220px, 1.05fr);
  gap: 8px;
  align-items: stretch;
  min-width: 0;
}

.shortcode-hide-node__editor,
.shortcode-hide-node__preview {
  min-width: 0;
}

.shortcode-hide-node__preview {
  min-height: 128px;
  padding-left: 8px;
  overflow: auto;
  border-left: 1px solid #d7dde7;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.65;
}

.shortcode-hide-node__preview--dashed-border {
  padding: 8px;
  border: 1px dashed #94a3b8;
  border-radius: 4px;
}

.shortcode-hide-node__preview :deep(:first-child) {
  margin-top: 0;
}

.shortcode-hide-node__preview :deep(:last-child) {
  margin-bottom: 0;
}

.shortcode-hide-node__preview :deep(pre) {
  overflow: auto;
  padding: 8px;
  border-radius: 4px;
  background: #0f172a;
  color: #e2e8f0;
}

.shortcode-hide-node__preview :deep(code) {
  padding: 0.1em 0.3em;
  border-radius: 3px;
  background: #e2e8f0;
}

.shortcode-hide-node__preview :deep(pre code) {
  padding: 0;
  background: transparent;
}

@media (max-width: 720px) {
  .shortcode-hide-node__body {
    grid-template-columns: minmax(0, 1fr);
  }

  .shortcode-hide-node__preview {
    padding-top: 8px;
    padding-left: 0;
    border-top: 1px solid #d7dde7;
    border-left: 0;
  }

  .shortcode-hide-node__preview--dashed-border {
    padding: 8px;
    border: 1px dashed #94a3b8;
  }
}
</style>
