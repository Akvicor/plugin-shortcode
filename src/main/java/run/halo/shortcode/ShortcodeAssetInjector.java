package run.halo.shortcode;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/**
 * Shortcode 前台资源注入器。
 *
 * <p>该类只根据最终 HTML 内容判断是否需要静态资源，不读取数据库或插件设置，
 * 因此可以被文章和独立页内容处理器复用。</p>
 */
final class ShortcodeAssetInjector {

    /** 插件静态资源在 Halo 前台暴露的基础路径。 */
    private static final String ASSET_BASE = "/plugins/plugin-shortcode/assets/static/shortcodes";

    /** 注入块开始标记，用于避免同一段内容被重复追加资源。 */
    private static final String START_MARKER = "<!-- plugin-shortcode start -->";

    /** 注入块结束标记，方便排查页面 HTML 中的资源来源。 */
    private static final String END_MARKER = "<!-- plugin-shortcode end -->";

    /** 黑幕 shortcode 在最终 HTML 中使用的 class 名。 */
    private static final String HEIMU_CLASS_MARKER = "heimu";

    /** 隐藏彩蛋 shortcode 在最终 HTML 中使用的 class 名。 */
    private static final String HIDE_AND_SEEK_CLASS_MARKER = "shortcode-hide-and-seek";

    private ShortcodeAssetInjector() {
    }

    /**
     * 根据内容中实际出现的 shortcode 按需追加资源标签。
     *
     * @param content 原始文章或独立页 HTML 内容
     * @param version 当前插件版本，用于静态资源缓存刷新
     * @return 已按需追加资源的 HTML 内容
     */
    static String inject(String content, String version) {
        String safeContent = content == null ? "" : content;
        if (safeContent.contains(START_MARKER)) {
            return safeContent;
        }

        boolean needsHeimu = containsHeimu(safeContent);
        boolean needsHideAndSeek = containsHideAndSeek(safeContent);
        if (!needsHeimu && !needsHideAndSeek) {
            return safeContent;
        }

        return safeContent + "\n" + buildTags(needsHeimu, needsHideAndSeek, version);
    }

    /**
     * 判断内容是否包含黑幕标签。
     *
     * @param content 待检测 HTML 内容
     * @return 包含黑幕 class 时返回 true
     */
    static boolean containsHeimu(String content) {
        String lowerContent = normalizeContent(content);
        return lowerContent.contains("class=\"heimu")
            || lowerContent.contains("class='heimu")
            || lowerContent.contains(" " + HEIMU_CLASS_MARKER + " ")
            || lowerContent.contains(" " + HEIMU_CLASS_MARKER + "\"")
            || lowerContent.contains(" " + HEIMU_CLASS_MARKER + "'");
    }

    /**
     * 判断内容是否包含隐藏彩蛋标签。
     *
     * @param content 待检测 HTML 内容
     * @return 包含隐藏彩蛋 class 时返回 true
     */
    static boolean containsHideAndSeek(String content) {
        return normalizeContent(content).contains(HIDE_AND_SEEK_CLASS_MARKER);
    }

    /**
     * 生成需要追加到内容末尾的资源标签。
     *
     * @param needsHeimu 是否需要黑幕样式
     * @param needsHideAndSeek 是否需要隐藏彩蛋样式和脚本
     * @param version 当前插件版本
     * @return 完整资源标签 HTML
     */
    static String buildTags(boolean needsHeimu, boolean needsHideAndSeek, String version) {
        String encodedVersion = encodeVersion(version);
        StringBuilder tags = new StringBuilder();
        tags.append(START_MARKER).append('\n');
        if (needsHeimu) {
            appendStylesheet(tags, "css/heimu.css", encodedVersion);
        }
        if (needsHideAndSeek) {
            appendStylesheet(tags, "css/hide_and_seek.css", encodedVersion);
            appendScript(tags, "js/hide_and_seek.js", encodedVersion);
        }
        tags.append(END_MARKER).append('\n');
        return tags.toString();
    }

    /**
     * 追加 CSS 引用标签。
     *
     * @param tags 正在构造的 HTML 标签缓冲区
     * @param path 相对于 shortcode 静态资源目录的 CSS 路径
     * @param encodedVersion 已编码的插件版本
     */
    private static void appendStylesheet(StringBuilder tags, String path, String encodedVersion) {
        tags.append("<link rel=\"stylesheet\" href=\"")
            .append(ASSET_BASE)
            .append('/')
            .append(path)
            .append("?version=")
            .append(encodedVersion)
            .append("\" />\n");
    }

    /**
     * 追加 JS 引用标签。
     *
     * @param tags 正在构造的 HTML 标签缓冲区
     * @param path 相对于 shortcode 静态资源目录的 JS 路径
     * @param encodedVersion 已编码的插件版本
     */
    private static void appendScript(StringBuilder tags, String path, String encodedVersion) {
        tags.append("<script data-pjax src=\"")
            .append(ASSET_BASE)
            .append('/')
            .append(path)
            .append("?version=")
            .append(encodedVersion)
            .append("\"></script>\n");
    }

    /**
     * 统一将 HTML 内容转为小写，便于做大小写不敏感检测。
     *
     * @param content 待规范化内容
     * @return 小写后的非空字符串
     */
    private static String normalizeContent(String content) {
        return (content == null ? "" : content).toLowerCase(Locale.ROOT);
    }

    /**
     * 编码版本号，避免版本字符串中的特殊字符破坏 URL。
     *
     * @param version 原始插件版本
     * @return URL query 可用的版本字符串
     */
    private static String encodeVersion(String version) {
        String safeVersion = version == null || version.isBlank() ? "dev" : version;
        return URLEncoder.encode(safeVersion, StandardCharsets.UTF_8);
    }
}
