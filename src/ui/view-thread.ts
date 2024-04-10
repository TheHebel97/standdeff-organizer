import {
    addThreadIdToLocalStorage,
    getDataFromLocalStorage,
    storeDataInLocalStorage
} from "../logic/helpers/helper-functions";
import {isUserForumMod} from "../logic/helpers/tw-helper";
import {addSdOptions} from "./components/add-sd-thread-options";
import {addSdPopup} from "./components/add-sd-thread-popup";


export function viewThread() {
    console.log("standdeff-organizer loaded in view_thread");
    const urlParams:URLSearchParams = new URLSearchParams(window.location.search);
    const currentThreadId: string | null = urlParams.get('thread_id');
    //wenn zuvor ein neuer SD Thread erstellt wurde, ist der Boolen in newThread true
    if (getDataFromLocalStorage("newThread")=== true) {
        console.log("new thread data found")
        storeDataInLocalStorage(false, "newThread")
        const edit_post_id : string | undefined = $(".post > a").attr("name")
        if (edit_post_id !== undefined) {
            addThreadIdToLocalStorage(currentThreadId, edit_post_id);
            console.log(getDataFromLocalStorage("threadIds"))
        } else {
            console.error("edit_post_id is undefined")
        }
    } else {
        console.log("no new thread data found")
    }

// auslesen der ThreadIds aus dem localstorage um zu verifizieren, dass es sich um eine SD Tabelle handelt
    let threadIds: { [key: string]: string } = getDataFromLocalStorage("threadIds");
    console.log(threadIds)
    if (threadIds !== undefined && currentThreadId !== null) {
        console.log("thread ids found")
        if (threadIds.hasOwnProperty(currentThreadId)) {
            //visuell anzeigen, dass es sich um die sd tabelle handelt
            const sdTableTitle = `<span style="color: #002bff; font-size: x-small"> (SD Tabelle)</span>`
            $(".clearfix > table").first().find("h2").append(sdTableTitle)
            console.log("thread id is in sd thread ids")
            const edit_post_id: string | null = urlParams.get('edit_post_id');
            if (edit_post_id === threadIds[currentThreadId]) {
                //
                //
                //
                //todo: hier eigentliches skript
                console.log("Sd tabellen bearbeitenmodus")

                return;
            }

            console.log("tabellenmodus")
//darstellen des bearbeitungszustands innerhelb der sd tabelle
            // über listener auf dem localstorage

            //todo: das noch auslagern

            if ($("#message").length) { //wenn textarea vorhanden


                const popupBoxBunkerAnfragen = `
                    <div class="popup_box_container" id="dbInfo_popup_box">
                        <div class='popup_box show'>
                            <a class='popup_box_close tooltip-delayed' href='#' onclick='$(\"#dbInfo_popup_box\").remove()'>&nbsp</a>
                            <div class='popup_box_content'>
                              <div class='center'>
                                <h2>Bunker Anfragen</h2>
                                <table>
                                    <tr>
                                        <th>ID</th>
                                        <th>Anzahl</th>
                                    </tr>
                                    <tr>
                                        <td><input type="text" class="inputId" style="width:50px;background-color:#EAD5AA"></td>
                                        <td><input type="text" class="inputAnzahl" style="width:50px;background-color:#EAD5AA"></td>
                                    </tr>
                                </table>
                              </div>
                            </div>
                        </div>
                        <div class='fader'></div>
                    </div>
    `
                if (!isUserForumMod()) {
                    console.log("user is not forum mod and text area is present")
                    $("#message").prop("readonly", true)
                    $("#message").on("click", function () {
                        console.log("test")
                        let element = $("#message")
                        $(element).css("wi")
                        const styledElem = `<div class="TEST" style="position: relative">
                                                          <div style="position: absolute; width: 614px; height: 220px; top:-16%; left: 0%; background-color: gray; opacity: 0.5">

                                                          </div>
                                                      </div>`
                        $("#message").parent().append(styledElem)
                        $(".TEST").append(element)
                        //$("#message").prop("disabled", false)
                    });

                }
//add ui

                //$('#ds_body')[0].insertAdjacentHTML('beforeend', popupBoxBunkerAnfragen)

            }


        } else {
            addSdOptions(currentThreadId);
        }
    } else {

        addSdPopup(currentThreadId);
    }
}
