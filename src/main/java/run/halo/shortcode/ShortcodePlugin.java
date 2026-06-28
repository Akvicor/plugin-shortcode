package run.halo.shortcode;

import org.springframework.stereotype.Component;
import run.halo.app.plugin.BasePlugin;
import run.halo.app.plugin.PluginContext;

/**
 * Shortcode 插件入口。
 *
 * <p>Halo 会通过该入口管理插件生命周期，本插件当前不需要额外启动或停止逻辑，
 * 具体功能由编辑器前端扩展和内容处理器提供。</p>
 */
@Component("shortcodePlugin")
public class ShortcodePlugin extends BasePlugin {

    /**
     * 创建插件入口实例。
     *
     * @param context Halo 注入的插件运行上下文
     */
    public ShortcodePlugin(PluginContext context) {
        super(context);
    }
}
