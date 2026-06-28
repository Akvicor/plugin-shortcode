package run.halo.shortcode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.plugin.PluginContext;
import run.halo.app.theme.ReactivePostContentHandler;

/**
 * 文章内容处理器。
 *
 * <p>处理器在文章 HTML 输出前执行，负责为实际使用了 shortcode 的文章追加
 * 对应 CSS 或 JS 资源。</p>
 */
@Component("shortcodeDefaultPostContentHandler")
public class DefaultPostContentHandler implements ReactivePostContentHandler {

    /** 当前类的日志记录器。 */
    private static final Logger LOG = LoggerFactory.getLogger(DefaultPostContentHandler.class);

    /** Halo 插件上下文，用于读取当前插件版本。 */
    private final PluginContext pluginContext;

    /**
     * 创建文章内容处理器。
     *
     * @param pluginContext Halo 注入的插件运行上下文
     */
    public DefaultPostContentHandler(PluginContext pluginContext) {
        this.pluginContext = pluginContext;
    }

    @Override
    public Mono<PostContentContext> handle(PostContentContext contentContext) {
        return Mono.fromSupplier(() -> {
            try {
                String injectedContent = ShortcodeAssetInjector.inject(
                    contentContext.getContent(),
                    pluginContext.getVersion()
                );
                contentContext.setContent(injectedContent);
            } catch (Exception e) {
                LOG.error("plugin-shortcode post content handle failed", e);
            }
            return contentContext;
        });
    }
}
