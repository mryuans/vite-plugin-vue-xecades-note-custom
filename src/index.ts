import type { PluginOption } from "vite";
import type { NotePluginOptions } from "./global";

import hmrWith from "./hmr";

import iter from "./cache/iter";
import search from "./cache/search";
import config from "./cache/config";
import route from "./cache/route";
import post from "./cache/post";

const pluginName = "vite-plugin-vue-xecades-note";

const launchWith = (options: NotePluginOptions) => async () => {
    const entries = await iter();

    search(entries, options);
    config(entries, options);
    await post(entries, options);
    route(entries, options);
};

const plugin = (options: NotePluginOptions): PluginOption => {
    options.pluginName = options.pluginName ?? pluginName;

    return {
        name: pluginName,
        enforce: "pre",
        apply: "serve",

        buildStart: launchWith(options),
        handleHotUpdate: hmrWith(options),
    };
};

export const launch = (options: NotePluginOptions) => launchWith(options)();
export default plugin;
export type { URL } from "./entry";
export type {
    Config,
    CachedSearchFn,
    SearchTarget,
    NavNode,
    MarkdownHeaderJsx,
    RouteMeta,
    CachedRouteRecord,
} from "./global";
