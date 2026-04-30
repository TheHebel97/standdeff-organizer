export type ScriptContext =
    | "place"
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
    const modeSource = urlParams.get("mode") !== null
        ? "mode"
        : urlParams.get("screenmode") !== null
            ? "screenmode"
            : "none";

    let context: ScriptContext = "unknown";
    if (screen === "place") {
        context = "place";
    } else if (screen === "forum") {
        if (mode === "view_thread") {
            context = "forum-view_thread";
        } else if (mode === "new_thread") {
            context = "forum-new_thread";
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
        forumId: urlParams.get("forum_id"),
        threadId: urlParams.get("thread_id"),
        targetVillageId: urlParams.get("target")
    };
}
