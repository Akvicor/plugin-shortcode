declare module "*.vue" {
  import type { DefineComponent } from "vue";

  /** Vue 单文件组件在 TypeScript 中的默认导出类型。 */
  const component: DefineComponent<
    Record<string, unknown>,
    Record<string, unknown>,
    any
  >;
  export default component;
}
