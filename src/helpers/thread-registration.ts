import {addThreadIdToLocalStorage} from "./helper-functions";

export function readSdPostId(): string | null {
    let postId: string | null = null;
    $(".post").each((_, post) => {
        const $post = $(post);
        const isSdPost = $post.find(".text b").toArray().some(element =>
            $(element).text().trim().startsWith("SD Tabelle Paketsystem"));
        if (!isSdPost || !$post.find(".text .bbcodetable").length) return;
        const anchor = $post.children("a[name]").toArray().find(element => /^\d+$/.test($(element).attr("name") ?? ""));
        if (anchor) postId = $(anchor).attr("name") ?? null;
        return postId === null ? undefined : false;
    });
    return postId;
}

export function registerSdThread(threadId: string | null, forumId: string | null): boolean {
    const postId = readSdPostId();
    const title = $(".clearfix > table").first().find("h2").text().trim();
    const forumName = $(".forum-container .selected").text().trim();
    const success = !!threadId && !!postId && !!forumId && addThreadIdToLocalStorage(threadId, postId, title, forumName, forumId);
    $(".sd-registration-error").remove();
    if (!success) {
        const message = !postId ? "Keine SD-Tabelle auf dieser Seite gefunden. Bitte den Beitrag mit der SD-Tabelle öffnen."
            : !forumId ? "Das zugehörige Forum wurde nicht erkannt. Bitte den Thread über das Forum öffnen."
            : "Die SD-Tabelle konnte nicht gespeichert werden. Bitte den Browser-Speicher prüfen und erneut versuchen.";
        const $target = $("#sd-thread-registration").length
            ? $("#sd-thread-registration") : $("#content_value").length ? $("#content_value") : $("body");
        $("<p class='sd-registration-error' role='alert'></p>").text(message).appendTo($target);
    }
    return !!success;
}
