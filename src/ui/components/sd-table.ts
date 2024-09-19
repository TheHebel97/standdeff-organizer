import {editSdPost} from "./edit-sd-post";
import {postLayout} from "./post-layout";
import {packages, updateData, rowSdTable, sdInquiry, Threads, newInquiry} from "../../types/types";
import {LocalStorageService} from "../../logic/local-storage-service";
import {isUserForumMod} from "../../logic/helpers/tw-helper";
import {
    applySettingsToMassUtLink,
    displayUpdatedSdTable,
    parseSdPosts,
    parseTableHtmlElemToSdState,
    updateSentPackagesInSdTable
} from "../../logic/helpers/table-helper";


export function sdTable(threads: Threads) {
    let updateData: updateData = parseSdPosts()
    console.log("visualisierung der sd tabelle")
//visuell anzeigen, dass es sich um die sd tabelle handelt
    const sdTableTitle = `<span style="color: #002bff; font-size: x-small"> (SD Tabelle)</span>`
    $(".clearfix > table").first().find("h2").append(sdTableTitle)
    $(".text").css("max-width", "100%")
    console.log("thread id is in sd thread ids")

    const localStorageService = LocalStorageService.getInstance();
    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const edit_post_id: string | null = urlParams.get('edit_post_id');
    const currentThreadId: string = urlParams.get('thread_id') || ""
    if (edit_post_id === threads[currentThreadId]?.sdPostId) {
        console.log("edit mode")
        editSdPost(updateData);
        return;
    }
    if ($("#message").length) { //wenn textarea vorhanden
        console.log("textarea vorhanden")
        postLayout(updateData);
        // return; // wenn textarea vorhanden, dann sd tabelle nicht visuell anhand den darunterleigenden posts anpassen
    }
//removal of all options for non mods
    if (!isUserForumMod()) {
        $(".postheader_right").each((index, elem) => {
            $(elem).children().each((index, elem) => {
                const keywords = ["Zitat", "Bearbeiten"];
                $(elem).text().split(" ").some(word => keywords.includes(word)) && $(elem).remove();
            });
        });
    }

    console.log("--------------------")
    const sdTablePost = $("a[name='" + threads[currentThreadId].sdPostId + "']").parent()
    const sdTableBody = $(sdTablePost).find("table").find("tbody")
    const postCache = $(sdTablePost).find("input[value=postCache]").siblings().find("span").text()
    let postCacheSplit: any;
    if (postCache.length > 2) {
        postCacheSplit = postCache.split(",")
    }
    // delete every map member of the updateData that is not in the postCache
    for (let key of postCacheSplit) {
        updateData.delete(key);
        if (!isUserForumMod()) {
            $("a[name='" + key + "']").parent().remove();
        }
    }


    if (sdTableBody.length === 0) {
        console.error("sd table body not found")
        return;
    }

    let sdTableState = parseTableHtmlElemToSdState(sdTableBody)
    localStorageService.setSdTableState(currentThreadId, sdTableState)
    console.log(localStorageService.getSdTableState(currentThreadId))
    //Schandfleck des typings, quasi weiße flagge gehisst -.-
    let inquiriesMap: Map<string, any> = new Map();
    let packagesMap: Map<string, any> = new Map();
    updateData.forEach((value, key) => {
        inquiriesMap.set(key, value.inquiries);
        packagesMap.set(key, value.packages);
    });

    //feat: an diesem Punkt kann die tabelle noch erweitert werden für zB neue Bunker anfragen // optional
    //erstmal werden aber nur bearbeitungen angezeigt

    let packagesToUpdateFromPosts: Map<string, any> = new Map();
    packagesMap.forEach((value, key) => {  // key = post id // value = packages (multiple)
        value.forEach((amount: string, id: string) => {
            if (packagesToUpdateFromPosts.has(id)) {
                let existingAmount = packagesToUpdateFromPosts.get(id);
                packagesToUpdateFromPosts.set(id, parseInt(existingAmount) + parseInt(amount));
            } else {
                packagesToUpdateFromPosts.set(id, parseInt(amount));
            }
        });
    })
    console.log("--");
    console.log(packagesToUpdateFromPosts)
    //localStorageService.setPackagesSent(currentThreadId, packagesToUpdate)

    displayUpdatedSdTable(packagesToUpdateFromPosts)
    sdTableState = parseTableHtmlElemToSdState(sdTableBody)
    localStorageService.setSdTableState(currentThreadId, sdTableState)
    //display sd zeugs für alle nutzer
    //if admin or mod dann zu löschende Posts selecten und
    updateSentPackagesInSdTable();
    applySettingsToMassUtLink()


    let removedPosts: any[] = [];
    if (isUserForumMod()) {
        const sdPostId = threads[currentThreadId].sdPostId;
        //find sd post
        const sdPosts = $("a[name='" + sdPostId + "']").parent()
        const postsToDelete = $(sdPosts).find("input[value=postCache]").siblings().find("span").text()
        if (postsToDelete !== "") {
            const postToDelete = postsToDelete.split(",")
            postToDelete.forEach((postId: string) => {
                $(`input[value=${postId}]`).prop("checked", true)
                $(`input[value=${postId}]`).parent().parent().css("background", "rgba(174,6,6,0.73)")
            })
        }
    }else {
        const sdPostId = threads[currentThreadId].sdPostId;
        const sdPostElement = $("a[name='" + sdPostId + "']").parent();
        sdPostElement.nextAll(".post").hide();
    }

    const showHiddenPosts = '<button class="btn" id="showPostsButton">Show hidden Posts</button>';
    $(".thread_button").last().parent().append(showHiddenPosts)

    $("#showPostsButton").on("click", function() {
        restorePosts();
        $(this).remove();
    });

    window.addEventListener('storage', (event) => {
        // Prüfen Sie den Schlüssel, der geändert wurde
        console.log(event.key)
        if (event.key === "standdeff-organizer") {
            // Führen Sie Ihre Aktion aus
            console.log('Der Wert von "standdeff-organizer" hat sich geändert!');
            updateSentPackagesInSdTable();
        }
    });

    localStorageService.setSdTableState(currentThreadId, sdTableState)

    function restorePosts() {
        const sdPostId = threads[currentThreadId].sdPostId;
        const sdPostElement = $("a[name='" + sdPostId + "']").parent();
        sdPostElement.nextAll(".post").show();
    }
}



