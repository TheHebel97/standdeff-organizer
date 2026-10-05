export type ScriptContext =
    | "place"
    | "overview-away_detail"
    | "forum-view_thread"
    | "forum-new_thread"
    | "settings"
    | "forum-unknown"
    | "unknown";

export type ScriptContextResolution = {
    context: ScriptContext;
    screen: string;
    mode: string;
    modeSource: "mode" | "screenmode" | "none";
    href: string;
    query: Record<string, string>;
    villageId: string | null;
    forumId: string | null;
    threadId: string | null;
    targetVillageId: string | null;
};

export type PageContext = ScriptContextResolution;

export function resolveForumId(urlParams: URLSearchParams): string | null {
    const fromUrl = urlParams.get("forum_id");
    if (fromUrl && /^\d+$/.test(fromUrl)) return fromUrl;
    const selectedLinks = document.querySelectorAll<HTMLAnchorElement>(
        ".forum-container .selected a[href], .forum-container a.selected[href]"
    );
    for (const link of selectedLinks) {
        const id = new URL(link.href, window.location.href).searchParams.get("forum_id");
        if (id && /^\d+$/.test(id)) return id;
    }
    return null;
}

function urlParamsToObject(urlParams: URLSearchParams): Record<string, string> {
    const result: Record<string, string> = {};
    urlParams.forEach((value, key) => {
        result[key] = value;
    });
    return result;
}

export function resolveScriptContext(): ScriptContextResolution {
    const urlParams = new URLSearchParams(window.location.search);
    const screen = urlParams.get("screen") || "";
    const mode = urlParams.get("mode") ?? urlParams.get("screenmode") ?? "";
    const type = urlParams.get("type") || "";
    const modeSource = urlParams.get("mode") !== null
        ? "mode"
        : urlParams.get("screenmode") !== null
            ? "screenmode"
            : "none";

    let context: ScriptContext = "unknown";
    if (screen === "place" && mode === "call") {
        context = "place";
    } else if (screen === "overview_villages" && mode === "units" && type === "away_detail") {
        context = "overview-away_detail";
    } else if (screen === "forum") {
        if (mode === "new_thread") {
            context = "forum-new_thread";
        } else if (urlParams.get("screenmode") === "view_thread" || mode === "view_thread") {
            context = "forum-view_thread";

        } else {
            context = "forum-unknown";
        }
    } else if (screen === "settings") {
        context = "settings";
    }

    return {
        context,
        screen,
        mode,
        modeSource,
        href: window.location.href,
        query: urlParamsToObject(urlParams),
        villageId: urlParams.get("village"),
        forumId: resolveForumId(urlParams),
        threadId: urlParams.get("thread_id"),
        targetVillageId: urlParams.get("target")
    };
}
