import type { HmrContext, Plugin } from "vite";
import type { NotePluginOptions } from "../global";
import type { Entry, Pathname } from "../entry";

import iter, { addEntry } from "../cache/iter";
import search from "../cache/search";
import config from "../cache/config";
import route from "../cache/route";
import { updateSomePosts } from "../cache/post";

const markdownHMR = async (
    options: NotePluginOptions,
    entries: Entry[],
    ctx: HmrContext
) => {
    let { file } = ctx;
    let pathname = file.replace(process.cwd() + "/", "");
    let entry = entries.find((e) => e.pathname === pathname);
    if (!entry) entry = await addEntry(pathname as Pathname);

    entry.resetCache();
    search(entries, options);
    config(entries, options); // nav
    await updateSomePosts(entries, [entry], options);
    route(entries, options); // meta
};

const configHMR = (
    options: NotePluginOptions,
    entries: Entry[],
    ctx: HmrContext
) => {
    config(entries, options);
};

const hmr =
    (options: NotePluginOptions): Plugin["handleHotUpdate"] =>
    async (ctx) => {
        const { server, file } = ctx;
        const entries = await iter();
        const docsPath = server.config.root + "/docs";
        const routesPath = server.config.root + "/cache/routes.tsx";
        const configPath = docsPath + "/config.yml";

        if (file === routesPath) return []; // Prevent route full-reload
        if (!file.startsWith(docsPath)) return;

        if (file.endsWith(".md")) await markdownHMR(options, entries, ctx);
        else if (file === configPath) configHMR(options, entries, ctx);
    };

export default hmr;
