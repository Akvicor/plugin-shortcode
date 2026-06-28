package run.halo.shortcode;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * Shortcode 资源注入器测试。
 */
class ShortcodeAssetInjectorTest {

    @Test
    void shouldKeepContentWhenNoShortcodeExists() {
        String content = "<p>普通内容</p>";

        String injected = ShortcodeAssetInjector.inject(content, "1.0.0");

        assertThat(injected).isEqualTo(content);
    }

    @Test
    void shouldInjectHeimuStylesheetOnlyWhenHeimuExists() {
        String content = "<span class=\"heimu\" title=\"提示\">黑幕</span>";

        String injected = ShortcodeAssetInjector.inject(content, "1.0.0");

        assertThat(injected).contains("css/heimu.css?version=1.0.0");
        assertThat(injected).doesNotContain("hide_and_seek.css");
        assertThat(injected).doesNotContain("hide_and_seek.js");
    }

    @Test
    void shouldInjectHideAndSeekStylesheetAndScriptWhenHideAndSeekExists() {
        String content = "<div class=\"shortcode-hide-and-seek\">隐藏内容</div>";

        String injected = ShortcodeAssetInjector.inject(content, "1.0.0");

        assertThat(injected).contains("css/hide_and_seek.css?version=1.0.0");
        assertThat(injected).contains("js/hide_and_seek.js?version=1.0.0");
    }

    @Test
    void shouldInjectBothAssetGroupsWhenBothShortcodesExist() {
        String content = """
            <span class="heimu" title="提示">黑幕</span>
            <div class="shortcode-hide-and-seek">隐藏内容</div>
            """;

        String injected = ShortcodeAssetInjector.inject(content, "1.0.0-SNAPSHOT");

        assertThat(injected).contains("css/heimu.css?version=1.0.0-SNAPSHOT");
        assertThat(injected).contains("css/hide_and_seek.css?version=1.0.0-SNAPSHOT");
        assertThat(injected).contains("js/hide_and_seek.js?version=1.0.0-SNAPSHOT");
    }

    @Test
    void shouldNotInjectAssetsRepeatedly() {
        String content = """
            <span class="heimu" title="提示">黑幕</span>
            <!-- plugin-shortcode start -->
            <link rel="stylesheet" href="/exists.css" />
            <!-- plugin-shortcode end -->
            """;

        String injected = ShortcodeAssetInjector.inject(content, "1.0.0");

        assertThat(injected).isEqualTo(content);
    }
}
