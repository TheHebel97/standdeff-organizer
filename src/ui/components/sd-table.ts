import {editSdPost} from "./edit-sd-post";
import {postLayout} from "./post-layout";
import {updateData, Threads} from "../../types/types";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {isUserForumMod} from "../../helpers/tw-helper";
import {
    applySettingsToMassUtLink,
    displayUpdatedSdTable,
    parseSdPosts,
    parseTableHtmlElemToSdState, trimVillageNameText, trimYearFromDateStrings,
    updateSentPackagesInSdTable
} from "../../helpers/table-helper";
import {Log} from "../../helpers/logging-helper";
import {PageContext} from "../../helpers/script-context";
import {getThreadIdFromContext, isAnswerMode, isEditingSdPost} from "../../helpers/thread-guards";

const log = Log.scope("sd-table");

type SdTablePageState = {
    currentThreadId: string;
    sdPostId: string;
    isForumMod: boolean;
    updateData: updateData;
    hasReplyTextarea: boolean;
    isAnswerMode: boolean;
};

type SdTableDerivedState = {
    isEditMode: boolean;
    postCacheIds: string[];
};

export function sdTable(pageContext: PageContext, threads: Threads) {
    const pageState = readPageState(pageContext, threads);
    const derivedState = deriveState(pageContext, pageState, threads);

    log.info("Rendering SD table view");
    renderChrome(pageState);

    log.state("SD table context", {
        currentThreadId: pageState.currentThreadId,
        sdPostId: pageState.sdPostId,
        knownThreadIds: Object.keys(threads),
        isForumMod: pageState.isForumMod,
        postCount: $(".post").length,
        hasReplyTextarea: pageState.hasReplyTextarea,
        isAnswerMode: pageState.isAnswerMode
    });

    if (derivedState.isEditMode) {
        log.info("Detected edit mode for SD post", {
            currentThreadId: pageState.currentThreadId,
            editPostId: pageContext.query.edit_post_id ?? ""
        });
        editSdPost(pageState.currentThreadId, pageState.updateData);
        return;
    }

    if (pageState.hasReplyTextarea) {
        postLayout(pageState.currentThreadId, pageState.isAnswerMode, pageState.updateData);
    }

    if (!pageState.isForumMod) {
        removeNonModActions();
    }

    const sdTableDom = readSdTableDom(pageState.sdPostId);
    log.info("Resolved SD table DOM nodes", {
        currentThreadId: pageState.currentThreadId,
        sdPostId: pageState.sdPostId,
        hasTableBody: sdTableDom.sdTableBody.length > 0,
        postCacheLength: sdTableDom.postCacheText.length
    });

    if (sdTableDom.sdTableBody.length === 0) {
        log.error("sd table body not found");
        return;
    }

    const filteredUpdateData = applyPostCacheFiltering(pageState, sdTableDom.postCacheText);
    let sdTableState = parseTableHtmlElemToSdState(sdTableDom.sdTableBody);

    LocalStorageHelper.getInstance().setSdTableState(pageState.currentThreadId, sdTableState);
    log.state("Initial SD table state loaded from DOM", {
        rowCount: sdTableState.size
    });

    const packagesToUpdateFromPosts = derivePackagesToUpdate(filteredUpdateData);
    log.state("Aggregated package deltas from posts", {
        packageCount: packagesToUpdateFromPosts.size,
        entries: Array.from(packagesToUpdateFromPosts.entries()).slice(0, 10)
    });

    displayUpdatedSdTable(pageState.currentThreadId, packagesToUpdateFromPosts);
    sdTableState = parseTableHtmlElemToSdState(sdTableDom.sdTableBody);
    LocalStorageHelper.getInstance().setSdTableState(pageState.currentThreadId, sdTableState);

    updateSentPackagesInSdTable(pageState.currentThreadId);
    applySettingsToMassUtLink(pageState.currentThreadId);
    trimVillageNameText();
    trimYearFromDateStrings();

    renderRoleSpecificView(pageState, sdTableDom.postCacheText);
    bindEvents(pageState, sdTableState);
}

function readPageState(pageContext: PageContext, threads: Threads): SdTablePageState {
    const currentThreadId = getThreadIdFromContext(pageContext);
    return {
        currentThreadId,
        sdPostId: threads[currentThreadId].sdPostId,
        isForumMod: isUserForumMod(),
        updateData: parseSdPosts(currentThreadId),
        hasReplyTextarea: $("#message").length > 0,
        isAnswerMode: isAnswerMode(pageContext)
    };
}

function deriveState(pageContext: PageContext, pageState: SdTablePageState, threads: Threads): SdTableDerivedState {
    return {
        isEditMode: isEditingSdPost(pageContext, threads),
        postCacheIds: readPostCacheIds(readSdTableDom(pageState.sdPostId).postCacheText)
    };
}

function renderChrome(pageState: SdTablePageState) {
    const sdTableTitle = `<span style="color: #002bff; font-size: x-small"> (SD Tabelle)</span>`;
    $(".clearfix > table").first().find("h2").append(sdTableTitle);
    $(".text").css("max-width", "100%");
    if (pageState.hasReplyTextarea) {
        log.info("Reply textarea detected; enabling post layout helpers");
    }
}

function removeNonModActions() {
    $(".postheader_right").each((index, elem) => {
        $(elem).children().each((childIndex, childElem) => {
            const keywords = ["Zitat", "Bearbeiten"];
            $(childElem).text().split(" ").some(word => keywords.includes(word)) && $(childElem).remove();
        });
    });
}

function readSdTableDom(sdPostId: string) {
    const sdTablePost = $("a[name='" + sdPostId + "']").parent();
    return {
        sdTablePost,
        sdTableBody: $(sdTablePost).find("table").find("tbody"),
        postCacheText: $(sdTablePost).find("input[value=postCache]").siblings().find("span").text()
    };
}

function readPostCacheIds(postCacheText: string): string[] {
    if (postCacheText.length <= 2) {
        return [];
    }
    return postCacheText.split(",");
}

function applyPostCacheFiltering(pageState: SdTablePageState, postCacheText: string): updateData {
    const filteredUpdateData: updateData = new Map(pageState.updateData);
    const postCacheIds = readPostCacheIds(postCacheText);
    for (const key of postCacheIds) {
        filteredUpdateData.delete(key);
        if (!pageState.isForumMod) {
            $("a[name='" + key + "']").parent().remove();
        }
    }
    if (postCacheIds.length > 0) {
        log.info("Applied post cache filter to updateData", {
            filteredPostIds: postCacheIds
        });
    }
    return filteredUpdateData;
}

function derivePackagesToUpdate(filteredUpdateData: updateData): Map<string, any> {
    let packagesToUpdateFromPosts: Map<string, any> = new Map();
    filteredUpdateData.forEach((value) => {
        value.packages.forEach((amount: string, id: string) => {
            const amountLower = String(amount ?? "").toLowerCase();
            const isDone = amountLower === "done";
            if (packagesToUpdateFromPosts.has(id)) {
                const existingAmount = packagesToUpdateFromPosts.get(id);
                const existingLower = String(existingAmount ?? "").toLowerCase();
                if (existingLower === "done") {
                    return;
                }
                if (isDone) {
                    packagesToUpdateFromPosts.set(id, "done");
                    return;
                }
                const existingNum = parseInt(existingAmount, 10);
                const amountNum = parseInt(amount, 10);
                packagesToUpdateFromPosts.set(id, (isNaN(existingNum) ? 0 : existingNum) + (isNaN(amountNum) ? 0 : amountNum));
            } else {
                if (isDone) {
                    packagesToUpdateFromPosts.set(id, "done");
                } else {
                    const amountNum = parseInt(amount, 10);
                    packagesToUpdateFromPosts.set(id, isNaN(amountNum) ? 0 : amountNum);
                }
            }
        });
    });
    return packagesToUpdateFromPosts;
}

function renderRoleSpecificView(pageState: SdTablePageState, postCacheText: string) {
    if (pageState.isForumMod) {
        log.info("Forum mod view: highlighting cached posts for deletion", {
            postsToDelete: postCacheText
        });
        if (postCacheText.length > 1) {
            let postToDelete = postCacheText.split(",");
            postToDelete.forEach((postId: string) => {
                $(`input[value=${postId}]`)
                    .prop("checked", true)
                    .parent().parent()
                    .css("background", "rgba(174,6,6,0.73)");
            });
        }
    } else {
        const sdPostElement = $("a[name='" + pageState.sdPostId + "']").parent();
        sdPostElement.nextAll(".post").hide();
        log.info("Non-mod view: hiding posts below SD table");
    }
}

function bindEvents(pageState: SdTablePageState, sdTableState: ReturnType<typeof parseTableHtmlElemToSdState>) {
    const localStorageService = LocalStorageHelper.getInstance();
    const showHiddenPosts = '<button class="btn" id="showPostsButton">Zeige versteckte Posts</button>';
    $(".thread_button").last().parent().append(showHiddenPosts);

    $("#showPostsButton").on("click", function () {
        const sdPostElement = $("a[name='" + pageState.sdPostId + "']").parent();
        sdPostElement.nextAll(".post").show();
        $(this).remove();
        log.info("User restored hidden posts in SD thread view");
    });

    window.addEventListener("storage", (event) => {
        log.info("Received storage event", {
            key: event.key
        });
        if (event.key === "standdeff-organizer") {
            log.info("Detected relevant localStorage change; syncing sent packages in SD table");
            updateSentPackagesInSdTable(pageState.currentThreadId);
        }
    });

    localStorageService.setSdTableState(pageState.currentThreadId, sdTableState);
}
