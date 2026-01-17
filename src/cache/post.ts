import fs from "fs-extra";
import { generateVueComponent } from "./template";
import * as inject from "../utils/inject";
import { getPostPathname } from "../entry/resolver";

import type { Entry, Pathname } from "../entry";
import type { NotePluginOptions } from "../global";

export const updateSomePosts = async (
    entries: Entry[],
    targets: Entry[],
    options: NotePluginOptions
) => {
    const tasks = targets.map(async (entry) => {
        const dist = entry.postPathname;
        const html = inject.slots(entry.html, entries);
        const cache = await generateVueComponent(entry, html, options);

        await fs.outputFile(dist, cache);

        console.log(
            `[Updated] ./${entry.postPathname} (${entry.front_matter.title})`
        );
    });

    await Promise.all(tasks);
};

const STATE_PATH = "./cache/.entry-state.json";

let state: Record<Pathname, number> = {};
let stateLoaded = false;
let stateDirty = false;

const loadState = async () => {
    if (stateLoaded) return;

    try {
        const stored = await fs.readJson(STATE_PATH);
        state = stored as Record<Pathname, number>;
    } catch {
        state = {};
    }

    stateLoaded = true;
    console.log(`[State] loaded cache for ${Object.keys(state).length} entries`);
};

const saveState = async () => {
    if (!stateDirty) return;

    await fs.ensureDir("./cache");
    await fs.outputJson(STATE_PATH, state, { spaces: 2 });
    stateDirty = false;
};

const removeStalePosts = async (entries: Entry[]) => {
    const current = new Set(entries.map((entry) => entry.pathname));
    const stale = (Object.keys(state) as Pathname[]).filter(
        (pathname) => !current.has(pathname)
    );

    for (const pathname of stale) {
        const dist = getPostPathname(pathname);
        await fs.remove(dist);
        delete state[pathname];
        stateDirty = true;
        console.log(`[Removed] ./${dist} (Entry deleted)`);
    }
};

const selectDirtyTargets = (entries: Entry[]) =>
    entries.filter((entry) => state[entry.pathname] !== entry.mtime);

const markEntries = (targets: Entry[]) => {
    for (const entry of targets) {
        state[entry.pathname] = entry.mtime;
        stateDirty = true;
    }
};

export const updateDirtyPosts = async (
    entries: Entry[],
    options: NotePluginOptions
) => {
    await loadState();
    await removeStalePosts(entries);

    const targets = selectDirtyTargets(entries);
    if (targets.length === 0) {
        console.log("[Skipped] ./cache/posts (up-to-date)");
        await saveState();
        return;
    }

    await updateSomePosts(entries, targets, options);
    markEntries(targets);
    await saveState();
};

export default updateDirtyPosts;
