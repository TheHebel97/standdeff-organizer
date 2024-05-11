import {editSdPost} from "./edit-sd-post";
import {postLayout} from "./post-layout";
import {packages, updateData, rowSdTable, sdInquiry, Threads} from "../../types/types";


export function sdTable(threads: Threads, updateData: updateData) {
    console.log("visualisierung der sd tabelle")
//visuell anzeigen, dass es sich um die sd tabelle handelt
    const sdTableTitle = `<span style="color: #002bff; font-size: x-small"> (SD Tabelle)</span>`
    $(".clearfix > table").first().find("h2").append(sdTableTitle)
    $(".text").css("max-width", "100%")
    console.log("thread id is in sd thread ids")


    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const edit_post_id: string | null = urlParams.get('edit_post_id');
    const currentThreadId: string = urlParams.get('thread_id') || ""
    if (edit_post_id === threads[currentThreadId]?.sdPostId) {
        editSdPost(updateData);
        return;
    }
    if ($("#message").length) { //wenn textarea vorhanden
        postLayout(updateData);
        return; // wenn textarea vorhanden, dann sd tabelle nicht visuell anhand den darunterleigenden posts anpassen
    }
    //display sd zeugs für alle nutzer
    //if admin or mod dann zu löschende Posts selecten und

}
