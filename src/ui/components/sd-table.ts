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

const log = Log.scope("sd-table");

export function sdTable(threads: Threads) {
    let updateData: updateData = parseSdPosts();
    log.info("Rendering SD table view");

    const sdTableTitle = `<span style="color: #002bff; font-size: x-small"> (SD Tabelle)</span>`;
    $(".clearfix > table").first().find("h2").append(sdTableTitle);
    $(".text").css("max-width", "100%");

    const localStorageService = LocalStorageHelper.getInstance();
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const edit_post_id: string | null = urlParams.get("edit_post_id");
    const currentThreadId: string = urlParams.get("thread_id") || "";
    const isForumMod = isUserForumMod();

    log.state("SD table context", {
        currentThreadId,
        edit_post_id,
        knownThreadIds: Object.keys(threads),
        isForumMod,
        postCount: $(".post").length
    });

    if (edit_post_id === threads[currentThreadId]?.sdPostId) {
        log.info("Detected edit mode for SD post", {
            currentThreadId,
            edit_post_id
        });
        editSdPost(updateData);
        return;
    }

    if ($("#message").length) {
        log.info("Reply textarea detected; enabling post layout helpers");
        postLayout(updateData);
    }

    if (!isForumMod) {
        $(".postheader_right").each((index, elem) => {
            $(elem).children().each((childIndex, childElem) => {
                const keywords = ["Zitat", "Bearbeiten"];
                $(childElem).text().split(" ").some(word => keywords.includes(word)) && $(childElem).remove();
            });
        });
    }

    const sdPostId = threads[currentThreadId].sdPostId;
    const sdTablePost = $("a[name='" + sdPostId + "']").parent();
    const sdTableBody = $(sdTablePost).find("table").find("tbody");
    const postCache = $(sdTablePost).find("input[value=postCache]").siblings().find("span").text();
    let postCacheSplit: string[] = [];

    log.info("Resolved SD table DOM nodes", {
        currentThreadId,
        sdPostId,
        hasTableBody: sdTableBody.length > 0,
        postCacheLength: postCache.length
    });

    if (postCache.length > 1) {
        if (postCache.length > 2) {
            postCacheSplit = postCache.split(",");
        }
        for (const key of postCacheSplit) {
            updateData.delete(key);
            if (!isForumMod) {
                $("a[name='" + key + "']").parent().remove();
            }
        }
        log.info("Applied post cache filter to updateData", {
            filteredPostIds: postCacheSplit
        });
    }

    if (sdTableBody.length === 0) {
        log.error("sd table body not found");
        return;
    }

    let sdTableState = parseTableHtmlElemToSdState(sdTableBody);
    localStorageService.setSdTableState(currentThreadId, sdTableState);
    log.state("Initial SD table state loaded from DOM", {
        rowCount: sdTableState.size
    });

    let inquiriesMap: Map<string, any> = new Map();
    let packagesMap: Map<string, any> = new Map();
    updateData.forEach((value, key) => {
        inquiriesMap.set(key, value.inquiries);
        packagesMap.set(key, value.packages);
    });

    let packagesToUpdateFromPosts: Map<string, any> = new Map();
    packagesMap.forEach((value) => {
        value.forEach((amount: string, id: string) => {
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

    log.state("Aggregated package deltas from posts", {
        packageCount: packagesToUpdateFromPosts.size,
        entries: Array.from(packagesToUpdateFromPosts.entries()).slice(0, 10)
    });

    displayUpdatedSdTable(packagesToUpdateFromPosts);
    sdTableState = parseTableHtmlElemToSdState(sdTableBody);
    localStorageService.setSdTableState(currentThreadId, sdTableState);

    updateSentPackagesInSdTable();
    applySettingsToMassUtLink();
    trimVillageNameText();
    trimYearFromDateStrings();

    if (isForumMod) {
        const sdPosts = $("a[name='" + sdPostId + "']").parent();
        const postsToDelete = $(sdPosts).find("input[value=postCache]").siblings().find("span").text();
        log.info("Forum mod view: highlighting cached posts for deletion", {
            postsToDelete
        });
        if (postsToDelete.length > 1) {
            let postToDelete = postsToDelete.split(",");
            postToDelete.forEach((postId: string) => {
                $(`input[value=${postId}]`)
                    .prop("checked", true)
                    .parent().parent()
                    .css("background", "rgba(174,6,6,0.73)");
            });
        }
    } else {
        const sdPostElement = $("a[name='" + sdPostId + "']").parent();
        sdPostElement.nextAll(".post").hide();
        log.info("Non-mod view: hiding posts below SD table");
    }

    const showHiddenPosts = '<button class="btn" id="showPostsButton">Zeige versteckte Posts</button>';
    $(".thread_button").last().parent().append(showHiddenPosts);

    $("#showPostsButton").on("click", function () {
        restorePosts();
        $(this).remove();
        log.info("User restored hidden posts in SD thread view");
    });

    window.addEventListener("storage", (event) => {
        log.info("Received storage event", {
            key: event.key
        });
        if (event.key === "standdeff-organizer") {
            log.info("Detected relevant localStorage change; syncing sent packages in SD table");
            updateSentPackagesInSdTable();
        }
    });

    localStorageService.setSdTableState(currentThreadId, sdTableState);

    function restorePosts() {
        const sdPostElement = $("a[name='" + sdPostId + "']").parent();
        sdPostElement.nextAll(".post").show();
    }
}
