import {addThreadIdToLocalStorage, getDataFromLocalStorage} from "../../logic/helpers/helper-functions";

export function addSdPopup(currentThreadId: string | null){
    console.log("no thread ids found")


    const popupBoxNewThread = `
                    <div class="popup_box_container" id="dbInfo_popup_box">
                        <div class='popup_box show'>
                            <a class='popup_box_close tooltip-delayed' href='#' onclick='$(\"#dbInfo_popup_box\").remove()'>&nbsp</a>
                            <div class='popup_box_content'>
                              <div class='center'>
                                <h2>Handelt es sich bei dem Thread um die Sd Tabelle?</h2>
                                <input id="safeThreadAsSd" type="button" value="Ja, bitte abspeichern" class="btn" style="margin-top: 5px;">
                              </div>
                            </div>
                        </div>
                        <div class='fader'></div>
                    </div>
    `
    $('#ds_body')[0].insertAdjacentHTML('beforeend', popupBoxNewThread)
    $("#safeThreadAsSd").on("click", function () {
        const edit_post_id = $(".post > a").attr("name")
        if (edit_post_id !== undefined) {
            addThreadIdToLocalStorage(currentThreadId, edit_post_id);
            console.log(getDataFromLocalStorage("threadIds"))
            $("#dbInfo_popup_box").remove()
        } else {
            console.error("edit_post_id is undefined")
        }

    });
}
