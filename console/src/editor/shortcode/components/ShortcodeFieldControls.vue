<script setup lang="ts">
import { ARROW_DIRECTIONS, getArrowDirection } from "../tags/arrow";
import type {
  ShortcodeAttrs,
  ShortcodeDefinition,
  ShortcodeFieldDefinition,
} from "../core/types";

/** 标签默认样式。 */
const DEFAULT_TAG_EFFECT = "light";

/** 标签预设颜色。 */
const TAG_TYPE_COLOURS: Record<string, string> = {
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
  custom: "#409EFF",
};

/**
 * 判断颜色值是否可写入颜色输入框。
 *
 * @param value 待判断的颜色值
 * @returns 是否为合法十六进制颜色
 */
function isHexColour(value: string): boolean {
  return /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(value);
}

/**
 * 根据标签样式和主色生成默认文字色。
 *
 * @param effect 标签视觉样式
 * @param colour 标签主色
 * @returns 默认文字色
 */
function getDefaultTagTextColour(effect: string, colour: string): string {
  if (effect === "dark") {
    return "#FFFFFF";
  }
  return colour;
}

/** 字段控件接收的渲染参数。 */
const props = defineProps<{
  /** 当前 shortcode 定义。 */
  definition: ShortcodeDefinition;
  /** 当前节点属性。 */
  attrs: ShortcodeAttrs;
  /** 是否按块级编辑布局展示。 */
  block?: boolean;
  /** 是否隐藏字段标题。 */
  hideLabels?: boolean;
}>();

/** 字段控件向父组件提交的属性更新。 */
const emit = defineEmits<{
  /** 更新节点的部分属性。 */
  (event: "update", attrs: Partial<ShortcodeAttrs>): void;
}>();

/**
 * 获取字段当前值。
 *
 * @param name 字段名称
 * @returns 当前字段字符串值
 */
function getFieldValue(name: string): string {
  const value = props.attrs[name as keyof ShortcodeAttrs];
  return typeof value === "string" ? value : "";
}

/**
 * 更新普通字段。
 *
 * @param field 字段定义
 * @param event 输入事件
 */
function updateField(field: ShortcodeFieldDefinition, event: Event) {
  const target = event.target as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement;
  emit("update", {
    [field.name]: target.value,
  } as Partial<ShortcodeAttrs>);
}

/**
 * 获取颜色输入框使用的字段值。
 *
 * @param field 字段定义
 * @returns 合法的颜色字段值
 */
function getColourFieldValue(field: ShortcodeFieldDefinition): string {
  const value = getFieldValue(field.name);
  if (isHexColour(value)) {
    return value;
  }
  return field.defaultValue;
}

/**
 * 更新标签样式并同步默认文字色。
 *
 * @param effect 标签视觉样式
 */
function updateTagEffect(effect: string) {
  const colour = getColourFieldValue({
    name: "colour",
    label: "背景颜色",
    type: "color",
    defaultValue: TAG_TYPE_COLOURS.primary,
  });
  emit("update", {
    tagEffect: effect,
    textColour: getDefaultTagTextColour(effect, colour),
  });
}

/**
 * 更新标签预设并同步主色和默认文字色。
 *
 * @param tagType 标签预设类型
 */
function updateTagType(tagType: string) {
  const effect = getFieldValue("tagEffect") || DEFAULT_TAG_EFFECT;
  const colour =
    tagType === "custom"
      ? getColourFieldValue({
          name: "colour",
          label: "背景颜色",
          type: "color",
          defaultValue: TAG_TYPE_COLOURS.primary,
        })
      : TAG_TYPE_COLOURS[tagType] || TAG_TYPE_COLOURS.primary;
  emit("update", {
    tagType,
    colour,
    textColour: getDefaultTagTextColour(effect, colour),
  });
}

/**
 * 更新标签背景色并自动切换为自定义预设。
 *
 * @param colour 标签主色
 */
function updateTagColour(colour: string) {
  const effect = getFieldValue("tagEffect") || DEFAULT_TAG_EFFECT;
  emit("update", {
    tagType: "custom",
    colour,
    textColour: getDefaultTagTextColour(effect, colour),
  });
}

/**
 * 更新箭头方向，同时同步方向对应的默认颜色。
 *
 * @param event 选择事件
 */
function updateArrowDirection(event: Event) {
  const target = event.target as HTMLSelectElement;
  const direction = getArrowDirection(target.value);
  emit("update", {
    direction: direction.value,
    colour: direction.defaultColour,
  });
}

/**
 * 更新选择字段。
 *
 * @param field 字段定义
 * @param event 选择事件
 */
function updateSelectField(field: ShortcodeFieldDefinition, event: Event) {
  const target = event.target as HTMLSelectElement;
  if (props.definition.kind === "tag" && field.name === "tagEffect") {
    updateTagEffect(target.value);
    return;
  }
  if (props.definition.kind === "tag" && field.name === "tagType") {
    updateTagType(target.value);
    return;
  }
  emit("update", {
    [field.name]: target.value,
  } as Partial<ShortcodeAttrs>);
}

/**
 * 更新颜色字段。
 *
 * @param field 字段定义
 * @param event 输入事件
 */
function updateColourField(field: ShortcodeFieldDefinition, event: Event) {
  const target = event.target as HTMLInputElement;
  if (props.definition.kind === "tag" && field.name === "colour") {
    updateTagColour(target.value);
    return;
  }
  updateField(field, event);
}

</script>

<template>
  <div
    class="shortcode-field-controls"
    :class="{ 'shortcode-field-controls--block': block }"
  >
    <label
      v-if="definition.kind === 'arrow'"
      class="shortcode-field-controls__field"
    >
      <span
        v-if="!hideLabels"
        class="shortcode-field-controls__label"
      >
        方向
      </span>
      <select
        class="shortcode-field-controls__select"
        :value="attrs.direction"
        @change="updateArrowDirection"
      >
        <option
          v-for="direction in ARROW_DIRECTIONS"
          :key="direction.value"
          :value="direction.value"
        >
          {{ direction.label }}
        </option>
      </select>
    </label>

    <label
      v-for="field in definition.fields"
      :key="field.name"
      class="shortcode-field-controls__field"
      :class="{
        'shortcode-field-controls__field--textarea': field.type === 'textarea',
      }"
    >
      <span
        v-if="!hideLabels"
        class="shortcode-field-controls__label"
      >
        {{ field.label }}
      </span>
      <textarea
        v-if="field.type === 'textarea'"
        class="shortcode-field-controls__textarea"
        :placeholder="field.placeholder"
        :value="getFieldValue(field.name)"
        @input="updateField(field, $event)"
      />
      <select
        v-else-if="field.type === 'select'"
        class="shortcode-field-controls__select"
        :value="getFieldValue(field.name) || field.defaultValue"
        @change="updateSelectField(field, $event)"
      >
        <option
          v-for="option in field.options || []"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <input
        v-else-if="field.type === 'color'"
        class="shortcode-field-controls__input shortcode-field-controls__input--color"
        type="color"
        :placeholder="field.placeholder"
        :value="getColourFieldValue(field)"
        @input="updateColourField(field, $event)"
      />
      <input
        v-else
        class="shortcode-field-controls__input"
        :type="field.type"
        :placeholder="field.placeholder"
        :value="getFieldValue(field.name)"
        @input="updateField(field, $event)"
      />
    </label>
  </div>
</template>

<style scoped>
.shortcode-field-controls {
  display: grid;
  gap: 8px;
}

.shortcode-field-controls__field {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.shortcode-field-controls--block .shortcode-field-controls__field {
  grid-template-columns: minmax(0, 1fr);
}

.shortcode-field-controls__label {
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
  white-space: nowrap;
}

.shortcode-field-controls__input,
.shortcode-field-controls__select,
.shortcode-field-controls__textarea {
  min-width: 0;
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  background: #fff;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.4;
}

.shortcode-field-controls__input,
.shortcode-field-controls__select {
  height: 28px;
  padding: 2px 7px;
}

.shortcode-field-controls__input--color {
  width: 46px;
  padding: 1px 2px;
}

.shortcode-field-controls__textarea {
  min-height: 128px;
  padding: 6px 8px;
  resize: vertical;
}
</style>
