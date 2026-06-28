package run.halo.shortcode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import run.halo.app.plugin.PluginContext;
import run.halo.app.theme.ReactiveSinglePageContentHandler;

/**
 * 独立页内容处理器。
 *
 * <p>处理器与文章内容处理器保持一致，只在独立页实际包含 shortcode 时追加
 * 对应 CSS 或 JS 资源。</p>
 */
@Component("shortcodeDefaultSinglePageContentHandler")
public class DefaultSinglePageContentHandler implements ReactiveSinglePageContentHandler {

    /** 当前类的日志记录器。 */
    private static final Logger LOG =
        LoggerFactory.getLogger(DefaultSinglePageContentHandler.class);

    /** Halo 插件上下文，用于读取当前插件版本。 */
    private final PluginContext pluginContext;

    /**
     * 创建独立页内容处理器。
     *
     * @param pluginContext Halo 注入的插件运行上下文
     */
    public DefaultSinglePageContentHandler(PluginContext pluginContext) {
        this.pluginContext = pluginContext;
    }

    @Override
    public Mono<SinglePageContentContext> handle(SinglePageContentContext contentContext) {
        return Mono.fromSupplier(() -> {
            try {
                String injectedContent = ShortcodeAssetInjector.inject(
                    contentContext.getContent(),
                    pluginContext.getVersion()
                );
                contentContext.setContent(injectedContent);
            } catch (Exception e) {
                LOG.error("plugin-shortcode single page content handle failed", e);
            }
            return contentContext;
        });
    }
}
