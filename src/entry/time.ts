import fs from "fs-extra";
import { simpleGit } from "simple-git";

import type { Pathname } from ".";

const CACHE_PATH = "./cache/.git-times.json";

interface CachedTime {
    mtime: number;
    created: string;
    updated: string;
}

export interface TimeRecord {
    created: string;
    updated: string;
    mtime: number;
}

const ignoreBefore = "2025-01-24T13:17:33.598Z";

const override = [
    {
        pathname: "docs/cs/ads/amortized-analysis.md",
        created: "2024-09-19T17:10:17+08:00",
        updated: "2024-09-24T17:12:51+08:00",
    },
    {
        pathname: "docs/cs/ads/avl-tree.md",
        created: "2024-09-11T13:51:55+08:00",
        updated: "2024-09-19T17:10:17+08:00",
    },
    {
        pathname: "docs/cs/ads/b-plus-tree.md",
        created: "2024-09-19T17:10:17+08:00",
        updated: "2024-10-14T15:47:25+08:00",
    },
    {
        pathname: "docs/cs/ads/binomial-queue.md",
        created: "2024-10-14T15:47:25+08:00",
        updated: "2024-10-14T15:47:25+08:00",
    },
    {
        pathname: "docs/cs/ads/leftist-heap.md",
        created: "2024-10-14T15:47:25+08:00",
        updated: "2024-10-14T15:47:25+08:00",
    },
    {
        pathname: "docs/cs/ads/red-black-tree.md",
        created: "2024-09-19T17:10:17+08:00",
        updated: "2024-10-14T15:47:25+08:00",
    },
    {
        pathname: "docs/cs/ads/review.md",
        created: "2025-01-15T11:54:29.776Z",
        updated: "2025-01-15T11:54:29.776Z",
    },
    {
        pathname: "docs/cs/ads/skew-heap.md",
        created: "2024-10-14T15:47:25+08:00",
        updated: "2024-10-14T15:47:25+08:00",
    },
    {
        pathname: "docs/cs/ads/splay-tree.md",
        created: "2024-09-19T17:10:17+08:00",
        updated: "2024-09-24T17:12:51+08:00",
    },
    {
        pathname: "docs/cs/others/c-language-cheatsheet.md",
        created: "2024-09-19T21:15:50+08:00",
        updated: "2024-09-19T21:15:50+08:00",
    },
    {
        pathname: "docs/cs/others/manuals-standards.md",
        created: "2024-09-19T21:15:50+08:00",
        updated: "2024-09-19T21:15:50+08:00",
    },
    {
        pathname: "docs/cs/others/mit-missing-semester.md",
        created: "2024-09-19T21:15:50+08:00",
        updated: "2024-10-04T17:39:49+08:00",
    },
    {
        pathname: "docs/ctf/game/zjuctf2024.md",
        created: "2024-10-23T22:02:46+08:00",
        updated: "2024-10-23T22:02:46+08:00",
    },
    {
        pathname: "docs/misc/french.md",
        created: "2024-09-19T20:37:46+08:00",
        updated: "2024-10-13T23:27:21+08:00",
    },
    {
        pathname: "docs/misc/test/customToken.md",
        created: "2024-08-19T14:28:15+08:00",
        updated: "2024-10-04T17:39:49+08:00",
    },
    {
        pathname: "docs/misc/test/latex.md",
        created: "2024-08-13T22:31:41+08:00",
        updated: "2024-10-04T17:39:49+08:00",
    },
    {
        pathname: "docs/misc/test/markdown.md",
        created: "2024-08-05T22:34:17+08:00",
        updated: "2024-09-19T20:41:28+08:00",
    },
    {
        pathname: "docs/sci/la/prove-that.md",
        created: "2024-09-19T21:15:50+08:00",
        updated: "2024-09-24T17:12:51+08:00",
    },
    {
        pathname: "docs/sci/la/what-is.md",
        created: "2024-09-19T21:15:50+08:00",
        updated: "2024-09-24T17:12:51+08:00",
    },
    {
        pathname: "docs/sci/ma/cheatsheet.md",
        created: "2024-09-19T21:15:50+08:00",
        updated: "2024-10-04T17:39:49+08:00",
    },
    {
        pathname: "docs/sci/ma/completeness-of-real-numbers.md",
        created: "2024-09-19T21:15:50+08:00",
        updated: "2024-09-24T17:12:51+08:00",
    },
    {
        pathname: "docs/sci/ma/prove-that.md",
        created: "2024-09-19T21:15:50+08:00",
        updated: "2024-09-24T17:12:51+08:00",
    },
    {
        pathname: "docs/sci/phy/chapter-27.md",
        created: "2024-09-24T21:51:32+08:00",
        updated: "2024-10-20T17:24:44+08:00",
    },
    {
        pathname: "docs/sci/phy/chapter-28.md",
        created: "2024-10-20T17:24:44+08:00",
        updated: "2024-10-20T17:24:44+08:00",
    },
    {
        pathname: "docs/sci/phy/chapter-29-30.md",
        created: "2024-10-20T17:24:44+08:00",
        updated: "2024-10-20T17:24:44+08:00",
    },
    {
        pathname: "docs/sci/prob/chapter-1.md",
        created: "2024-10-07T21:20:56+08:00",
        updated: "2024-10-27T20:36:28+08:00",
    },
    {
        pathname: "docs/sci/prob/chapter-2.md",
        created: "2024-10-27T20:36:28+08:00",
        updated: "2024-12-07T15:08:08+08:00",
    },
    {
        pathname: "docs/sci/prob/chapter-3.md",
        created: "2024-11-21T17:19:55+08:00",
        updated: "2024-11-21T18:02:11+08:00",
    },
    {
        pathname: "docs/sci/prob/distribution.md",
        created: "2024-11-21T17:19:55+08:00",
        updated: "2024-12-07T15:02:06+08:00",
    },
];

let cache: Record<Pathname, CachedTime> = {};
let loaded = false;
let dirty = false;

const loadCache = async () => {
    if (loaded) return;

    try {
        const stored = await fs.readJson(CACHE_PATH);
        cache = stored as Record<Pathname, CachedTime>;
    } catch {
        cache = {};
    }

    loaded = true;
};

const saveCache = async () => {
    if (!dirty) return;

    await fs.ensureDir("./cache");
    await fs.outputJson(CACHE_PATH, cache, { spaces: 2 });
    dirty = false;
};

export const flushTimeCache = async () => {
    await loadCache();
    await saveCache();
};

export const timeOf = async (pathname: Pathname): Promise<TimeRecord> => {
    await loadCache();

    const stat = await fs.stat(pathname);
    const mtime = stat.mtimeMs;
    const cached = cache[pathname];
    if (cached && cached.mtime === mtime) {
        return {
            created: cached.created,
            updated: cached.updated,
            mtime: cached.mtime,
        };
    }

    const git = simpleGit();
    const commits = await git.log({ file: pathname });
    const overrideEntry = override.find((item) => item.pathname === pathname);

    let created: string;
    let updated: string;

    if (commits.total === 0) {
        const now = new Date().toISOString();
        created = overrideEntry ? overrideEntry.created : now;
        updated = overrideEntry ? overrideEntry.updated : now;
    } else {
        const gitCreated = commits.all.at(-1)!.date;
        const gitUpdated = commits.latest!.date;

        created = overrideEntry ? overrideEntry.created : gitCreated;
        updated =
            gitUpdated < ignoreBefore && overrideEntry
                ? overrideEntry.updated
                : gitUpdated;
    }

    cache[pathname] = { mtime, created, updated };
    dirty = true;

    return { created, updated, mtime };
};
