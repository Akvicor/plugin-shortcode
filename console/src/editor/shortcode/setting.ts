import {
  SHORTCODE_DEFINITIONS,
} from "./core/registry";
import type { ShortcodeDefinition } from "./core/types";

/** 插件 ConfigMap 名称，需要与 plugin.yaml 中的 configMapName 保持一致。 */
const CONFIG_MAP_NAME = "plugin-shortcode-configMap";

/** 设置表单分组名，需要与 extensions/settings.yaml 中的 group 保持一致。 */
const EDITOR_GROUP_KEY = "editor";

/**
 * 编辑器 shortcode 启用状态集合。
 */
export type ShortcodeEnabledSettings = Record<string, boolean>;

/** 默认启用状态：所有 shortcode 默认启用，避免升级后功能入口突然消失。 */
const DEFAULT_ENABLED_SETTINGS = SHORTCODE_DEFINITIONS.reduce(
  (settings, definition) => {
    settings[definition.settingKey] = true;
    return settings;
  },
  {} as ShortcodeEnabledSettings
);

/** 当前缓存的启用状态。 */
let cachedEnabledSettings: ShortcodeEnabledSettings = {
  ...DEFAULT_ENABLED_SETTINGS,
};

/** 正在进行的设置加载任务，避免编辑器多次初始化时重复请求。 */
let loadingPromise: Promise<ShortcodeEnabledSettings> | null = null;

/**
 * 将设置值规范化为布尔值。
 *
 * @param value ConfigMap 中读取到的原始值
 * @param fallback 默认值
 * @returns 规范化后的布尔值
 */
function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  return fallback;
}

/**
 * 从 ConfigMap data 中解析编辑器功能开关。
 *
 * @param data ConfigMap data 字段
 * @returns 合并默认值后的启用状态
 */
function parseEnabledSettings(
  data: Record<string, string> | undefined
): ShortcodeEnabledSettings {
  const editorConfigRaw = data?.[EDITOR_GROUP_KEY];
  if (!editorConfigRaw) {
    return { ...DEFAULT_ENABLED_SETTINGS };
  }

  try {
    const editorConfig = JSON.parse(editorConfigRaw) as Record<string, unknown>;
    const settings = { ...DEFAULT_ENABLED_SETTINGS };
    SHORTCODE_DEFINITIONS.forEach((definition) => {
      settings[definition.settingKey] = normalizeBoolean(
        editorConfig[definition.settingKey],
        true
      );
    });
    return settings;
  } catch {
    return { ...DEFAULT_ENABLED_SETTINGS };
  }
}

/**
 * 初始化并缓存编辑器功能开关。
 *
 * @returns 当前编辑器功能开关集合
 */
export async function initShortcodeEnabledSettings(): Promise<ShortcodeEnabledSettings> {
  if (!loadingPromise) {
    loadingPromise = (async () => {
      try {
        const response = await fetch(
          `/api/v1alpha1/configmaps/${encodeURIComponent(CONFIG_MAP_NAME)}`,
          {
            method: "GET",
            credentials: "same-origin",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`request failed: ${response.status}`);
        }

        const configMap = (await response.json()) as {
          data?: Record<string, string>;
        };
        cachedEnabledSettings = parseEnabledSettings(configMap.data);
      } catch {
        cachedEnabledSettings = { ...DEFAULT_ENABLED_SETTINGS };
      }

      return cachedEnabledSettings;
    })();
  }

  return loadingPromise;
}

/**
 * 判断某个 shortcode 功能当前是否启用。
 *
 * @param definition shortcode 功能定义
 * @returns 启用时返回 true
 */
export function isShortcodeEnabled(definition: ShortcodeDefinition): boolean {
  return cachedEnabledSettings[definition.settingKey] !== false;
}

/**
 * 获取当前启用的 shortcode 功能定义。
 *
 * @returns 经过设置过滤后的功能定义列表
 */
export function getEnabledShortcodeDefinitions(): ShortcodeDefinition[] {
  return SHORTCODE_DEFINITIONS.filter(isShortcodeEnabled);
}
