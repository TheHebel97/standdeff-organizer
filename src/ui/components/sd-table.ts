import {editSdPost} from "./edit-sd-post";
import {postLayout} from "./post-layout";

export function sdTable(threadIds: { [key: string]: string }) {
    console.log("visualisierung der sd tabelle")
//visuell anzeigen, dass es sich um die sd tabelle handelt
    const sdTableTitle = `<span style="color: #002bff; font-size: x-small"> (SD Tabelle)</span>`
    $(".clearfix > table").first().find("h2").append(sdTableTitle)
    console.log("thread id is in sd thread ids")


    const urlParams: URLSearchParams = new URLSearchParams(window.location.search);
    const edit_post_id: string | null = urlParams.get('edit_post_id');
    const currentThreadId: string | null = urlParams.get('thread_id') || ""
    if (edit_post_id === threadIds[currentThreadId]) {
        editSdPost();
        return;
    }
    if ($("#message").length) { //wenn textarea vorhanden
        postLayout();
    }


}
