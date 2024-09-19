import {addThreadIdToLocalStorage,} from "../../helpers/helper-functions";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {Log} from "../../helpers/logging-helper";

export function addSdPopup(currentThreadId: string | null){
    const localStorageService = LocalStorageHelper.getInstance();
    Log.info("no thread ids found")


    const popupBoxNewThread = `
                    <div class="popup_box_container" id="dbInfo_popup_box">
                        <div class='popup_box show'>
                            <a class='popup_box_close tooltip-delayed' href='#' onclick='$(\"#dbInfo_popup_box\").remove()'>&nbsp</a>
                            <div class='popup_box_content'>
                              <div class='center'>
                                <h2>Handelt es sich bei dem Thread um die Sd Tabelle?</h2>
                                <input id="safeThreadAsSd" type="button" value="Ja, bitte abspeichern" class="btn" style="margin-top: 5px;">
                                <input id="hideFuturePopup" type="button" value="Popup permanent ausblenden" class="btn" style>
                              </div>
                            </div>
                        </div>
                        <div class='fader'></div>
                    </div>
    `
    if(localStorageService.getFirstStartPopup){
        $('#ds_body')[0].insertAdjacentHTML('beforeend', popupBoxNewThread)
        $("#safeThreadAsSd").on("click", function () {
            const urlParams = new URLSearchParams(window.location.search);
            const edit_post_id = $(".post > a").attr("name")
            const thread_name: string | null = $(".clearfix > table").first().find("h2").text();
            const forum_name: string | null = $(".forum-container").find(".selected").text().trim();
            const forum_id= urlParams.get('forum_id');
            if (edit_post_id !== undefined) {
                addThreadIdToLocalStorage(currentThreadId, edit_post_id, thread_name, forum_name, forum_id);
                Log.info(localStorageService.getAllThreads)
                $("#dbInfo_popup_box").remove()
            } else {
                Log.error("edit_post_id is undefined")
            }

        });
        $("#hideFuturePopup").on("click", function () {
            localStorageService.setFirstStartPopup = false;
            $("#dbInfo_popup_box").remove()
        });
    }

}
