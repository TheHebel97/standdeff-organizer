import {editSdPost} from "./edit-sd-post";
import {postLayout} from "./post-layout";
import {packages, updateData, rowSdTable, sdInquiry, Threads, newInquiry} from "../../types/types";
import {LocalStorageService} from "../../logic/local-storage-service";
import {isUserForumMod} from "../../logic/helpers/tw-helper";
import {displayUpdatedSdTable, parseTableHtmlElemToSdState} from "../../logic/helpers/table-helper";


export function sdTable(threads: Threads, updateData: updateData) {
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
        return; // wenn textarea vorhanden, dann sd tabelle nicht visuell anhand den darunterleigenden posts anpassen
        return; // wenn textarea vorhanden, dann sd tabelle nicht visuell anhand den darunterleigenden posts anpassen
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

    let packagesToUpdate: Map<string, any> = new Map();
    packagesMap.forEach((value, key) => {  // key = post id // value = packages (multiple)
        value.forEach((amount:string, id:string) => {
            if (packagesToUpdate.has(id)) {
                let existingAmount = packagesToUpdate.get(id);
                packagesToUpdate.set(id, parseInt(existingAmount) + parseInt(amount));
            } else {
                packagesToUpdate.set(id, parseInt(amount));
            }
        });
    })
    console.log(packagesToUpdate)
    localStorageService.setPackagesSent(currentThreadId, packagesToUpdate)

    displayUpdatedSdTable()
    //display sd zeugs für alle nutzer
    //if admin or mod dann zu löschende Posts selecten und

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
    }

}



