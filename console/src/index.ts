import { definePlugin } from "@halo-dev/console-shared";

export default definePlugin({
  components: {},
  routes: [],
  extensionPoints: {
    "default:editor:extension:create": async () => {
      const { initShortcodeEnabledSettings } = await import(
        "./editor/shortcode/setting"
      );
      await initShortcodeEnabledSettings();
      const { ShortcodeExtensions } = await import("./editor/shortcode");
      return ShortcodeExtensions;
    },
  },
});
