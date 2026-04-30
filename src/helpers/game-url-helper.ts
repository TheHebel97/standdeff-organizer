import {Log} from "./logging-helper";

const log = Log.scope("game-url");

type GameUrlParamValue = string | number | boolean | null | undefined;

function getCurrentSearchParams(): URLSearchParams {
    return new URLSearchParams(window.location.search);
}

function getCurrentVillageId(): string {
    const currentVillageId = getCurrentSearchParams().get("village");
    if (currentVillageId) {
        return currentVillageId;
    }
    if (typeof game_data !== "undefined" && game_data.village?.id !== undefined) {
        return String(game_data.village.id);
    }
    return "0";
}

function setUrlParam(url: URL, key: string, value: GameUrlParamValue) {
    if (value === undefined || value === null || value === "") {
        url.searchParams.delete(key);
        return;
    }
    url.searchParams.set(key, String(value));
}

function applySitterParam(url: URL) {
    const sitterParam = getCurrentSearchParams().get("t");
    if (sitterParam) {
        url.searchParams.set("t", sitterParam);
    }
}

function resolveBaseGameUrl(): URL {
    if (typeof game_data !== "undefined" && game_data.link_base_pure) {
        const url = new URL(game_data.link_base_pure, window.location.origin);
        log.trace("Using game_data.link_base_pure for URL generation", {
            linkBasePure: game_data.link_base_pure
        });
        return url;
    }

    const fallbackUrl = new URL(window.location.pathname, window.location.origin);
    fallbackUrl.searchParams.set("village", getCurrentVillageId());
    fallbackUrl.searchParams.set("screen", "");
    log.warn("Falling back to window.location for URL generation", {
        href: window.location.href
    });
    return fallbackUrl;
}

export function buildGameUrl(
    screen: string,
    params: Record<string, GameUrlParamValue> = {},
    villageId?: string | number | null,
): string {
    const url = resolveBaseGameUrl();
    setUrlParam(url, "village", villageId ?? getCurrentVillageId());
    setUrlParam(url, "screen", screen);
    applySitterParam(url);

    Object.entries(params).forEach(([key, value]) => {
        setUrlParam(url, key, value);
    });

    return url.toString();
}

export function buildMassUtCallUrl(targetVillageId: string | number, villageId?: string | number | null): string {
    return buildGameUrl("place", {
        mode: "call",
        target: targetVillageId
    }, villageId);
}

export function buildForumThreadUrl(
    forumId: string,
    threadId: string,
    villageId?: string | number | null,
): string {
    return buildGameUrl("forum", {
        screenmode: "view_thread",
        forum_id: forumId,
        thread_id: threadId
    }, villageId);
}
