import {registerSdThread} from "../../helpers/thread-registration";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {Log} from "../../helpers/logging-helper";

const log = Log.scope("first-start-thread-popup");

export function addSdPopup(currentThreadId: string | null, forumId: string | null, onRegistered?: () => void) {
    const localStorageService = LocalStorageHelper.getInstance();
    log.info("no thread ids found");

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
    `;
    if (localStorageService.getFirstStartPopup && !$("#dbInfo_popup_box").length) {
        $("#ds_body")[0].insertAdjacentHTML("beforeend", popupBoxNewThread);
        $("#safeThreadAsSd").on("click", function () {
            if (registerSdThread(currentThreadId, forumId)) {
                $("#dbInfo_popup_box").remove();
                onRegistered?.();
            }

        });
        $("#hideFuturePopup").on("click", function () {
            localStorageService.setFirstStartPopup = false;
            $("#dbInfo_popup_box").remove();
            log.info("First-start popup disabled by user");
        });
    }
}
