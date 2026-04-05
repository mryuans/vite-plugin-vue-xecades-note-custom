import fs from "fs-extra";
import yaml from "yaml";

import type { RawConfig, RawNavNode } from "../convention";
import type { Config, NavNode, NotePluginOptions } from "../global";
import type { Entry, URL } from "../entry";

/**
 * Read and parse YML config file to object.
 *
 * @param path - Path to the config file.
 * @returns Raw config data.
 */
const readYML = (path: string): RawConfig => {
    const raw = fs.readFileSync(path, "utf-8");
    return yaml.parse(raw);
};

/**
 * Parse raw nav data to nav nodes.
 *
 * @param raw - Raw nav data to be parsed.
 * @param entries - Parsed entry objects.
 * @returns Parsed nav data.
 */
const parseNav = (raw: RawNavNode[], entries: Entry[]): NavNode[] => {
    const name_of = (node: RawNavNode) => Object.keys(node)[0];
    const title_of = (pathname: string) => {
        const filterOut = entries.filter((d) => d.pathname === pathname)
        const isUndefined = !filterOut.length
        if (isUndefined) {
            throw new Error(`The file you defined in config yaml file: ${pathname} is not created.`);
            return "Not defined page (Check your config yaml file)" /* though cannot attach */
        } else {
            return filterOut[0].front_matter.title;
        }
    }

    /**
     * Recursively traverse and parse raw nav data.
     */
    const dfs = (branch: RawNavNode | string, path: string): NavNode => {
        if (typeof branch === "string") {
            // Leaf node
            const name: string = branch;
            path += "/" + name;

            const pathname: string = "docs" + path + ".md";

            return {
                title: title_of(pathname),
                name: name,
                link: path as URL,
                children: [],
            };
        } else {
            // Branch node, i.e. `/index.md`
            const name: string = name_of(branch);
            path += "/" + name;

            const pathname: string = "docs" + path + "/index.md";

            const res: NavNode = {
                title: title_of(pathname),
                name: name,
                link: path as URL,
                children: [],
            };

            const children: RawNavNode[] | string = branch[name];

            for (const child of children) {
                res.children.push(dfs(child, path));
            }

            return res;
        }
    };

    const res: NavNode[] = [];

    for (const branch of raw) {
        const root: NavNode = dfs(branch, "");
        res.push(root);
    }

    return res;
};

/**
 * Parse and cache config (`./docs/config.yml`) to `./cache/config.ts`.
 *
 * @note This module caches `config.yml`.
 *
 * @param entries - Parsed entry objects.
 */
export default (entries: Entry[], options: NotePluginOptions) => {
    const config_path = "./docs/config.yml";
    const dist = "./cache/config.ts";

    const raw: RawConfig = readYML(config_path);
    const config: Config = { ...raw, nav: parseNav(raw.nav, entries) };

    const cache =
        `import type { Config } from "${options.pluginName}";\n` +
        `const config: Config = ${JSON.stringify(config)};\n` +
        "export default config;\n";

    fs.outputFileSync(dist, cache);
    console.log(`[Updated] ${dist} (Configuration)`);
};
