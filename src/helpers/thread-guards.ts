import {Threads} from "../types/types";
import {PageContext} from "./script-context";

export function getThreadIdFromContext(pageContext: PageContext): string {
    return pageContext.threadId ?? "";
}

export function getForumIdFromContext(pageContext: PageContext): string | null {
    return pageContext.forumId;
}

export function isKnownSdThread(threads: Threads, pageContext: PageContext): boolean {
    const threadId = getThreadIdFromContext(pageContext);
    return threadId !== "" && hasValidThreadMetadata(threads[threadId]);
}

export function hasValidThreadMetadata(thread:Threads[string] | undefined):boolean {
    return !!thread && /^[1-9]\d*$/.test(thread.sdPostId) && /^[1-9]\d*$/.test(thread.forumId);
}

export function shouldShowFirstStartPopup(threads: Threads): boolean {
    return !Object.values(threads).some(hasValidThreadMetadata);
}

export function isEditingSdPost(pageContext: PageContext, threads: Threads): boolean {
    const threadId = getThreadIdFromContext(pageContext);
    const editPostId = pageContext.query.edit_post_id ?? "";
    return threadId !== "" && editPostId !== "" && threads[threadId]?.sdPostId === editPostId;
}

export function isAnswerMode(pageContext: PageContext): boolean {
    return Object.prototype.hasOwnProperty.call(pageContext.query, "answer");
}
