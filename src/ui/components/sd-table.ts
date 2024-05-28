import {editSdPost} from "./edit-sd-post";
import {postLayout} from "./post-layout";
import {packages, updateData, rowSdTable, sdInquiry, Threads} from "../../types/types";
import {LocalStorageService} from "../../logic/local-storage-service";
import {isUserForumMod} from "../../logic/helpers/tw-helper";
import {parseTableHtmlElemToSdState} from "../../logic/helpers/table-helper";


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
    console.log(sdTablePost)
    const sdTableBody = $(sdTablePost).find("table").find("tbody")
    console.log(sdTableBody)

    if(sdTableBody.length === 0){
        console.error("sd table body not found")
        return;
    }

    let sdTableState = parseTableHtmlElemToSdState(sdTableBody)
    console.log(sdTableState)
    localStorageService.setSdTableState(currentThreadId, sdTableState)
    console.log(localStorageService.getSdTableState(currentThreadId))
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
