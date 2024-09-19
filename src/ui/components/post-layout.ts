import {isUserForumMod} from "../../helpers/tw-helper";
import {showRequestPopup} from "./request-popup";
import {convertMessageRequestStringToRequestArray} from "../../helpers/table-helper";
import {updateData, sdInquiry} from "../../types/types";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";

export function postLayout(updateData: updateData) {

    Log.info("parsed posts in view thread")
    Log.info(updateData) //parsed posts in view thread // für die darstellung der sd tabelle
    Log.info("post layout");
    const localStorageService = LocalStorageHelper.getInstance();
    const urlParams = new URLSearchParams(window.location.search);
    const currentThreadId = urlParams.get("thread_id") || "";
    if (urlParams.has("answer")) {


        if (!isUserForumMod()) {
            Log.info("user is not forum mod and text area is present")
            $("#message").prop("readonly", true)
            let element = $("#message")
            const styledElem = `<div class="hideUserInput" style="position: relative">
                                                          <div id="messageCover" style="position: absolute; width: 614px; height: 220px; top:-16%; left: 0%; background-color: gray; opacity: 0.5"></div>
                                                      </div>`
            $("#message").parent().append(styledElem)
            $(".hideUserInput").append(element)
            $(".hideUserInput").on("dblclick", function () {
                $("#messageCover").remove()
                $("#message").prop("readonly", false)
            });
        }
        const finishedRequests = localStorageService.getPackagesSent(currentThreadId).size;
        Log.info(finishedRequests)
        const postLayout = `
<input class="btn" type="button" value="Bunker anfragen" id="requestBunker">
<input class="btn" type="button" value="Bearbeitung eintragen" id="addBearbeitung">`
        $("input[name=preview]").remove()
        $("input[name=send]").parent().prepend(postLayout)
        if (finishedRequests > 0) {
            $("#addBearbeitung").after('<span class="notification-badge" id="notificationBadge">!</span>');
            const style = document.createElement('style');
            style.innerHTML = `
.notification-badge {
  position: relative;
  top: -10px;
  right: 10px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 5px 10px;
  font-size: 12px;
}`;
            document.head.appendChild(style);
        }


//     if (!urlParams.has("answer")) {
//
//         Log.info("bearbeiten eines posts, der nicht die sd tabelle ist")
//         let editText: String = String($("#message").val());
//         let pastRequests: sdInquiry[] = localStorageService.getSdInquiry(currentThreadId) || [] as sdInquiry[];
//         let newRequests: sdInquiry[] = convertMessageRequestStringToRequestArray(editText) || [] as sdInquiry[];
//
// // Merge pastRequests and newRequests
//         pastRequests = [...pastRequests, ...newRequests];
//
// // Remove duplicates based on coords
//         let uniqueRequests: sdInquiry[] = [];
//         let map = new Map();
//
//         for (let request of pastRequests) {
//             if (!map.has(request.coords)) {
//                 map.set(request.coords, true);
//                 uniqueRequests.push(request);
//             }
//         }
//         localStorageService.setSdInquiry(currentThreadId, uniqueRequests);
//     }
        Log.info("neuer post")


        $("#requestBunker").on("click", function () {
            showRequestPopup();
            Log.info("past requests");
        })
        $("#addBearbeitung").on("click", function () {

            $("input[name=send]").on("click", function () {
                localStorageService.setPackagesSent(currentThreadId, new Map());
            });
            $("#notificationBadge").remove();

            const packagesSent = localStorageService.getPackagesSent(currentThreadId)
            let res = "";
            packagesSent.forEach((value, key) => {
                res += `${key} ${value}\n`
            });

            $("#message").val(res)
            Log.info("bearbeitung eintragen")
        })
        $("input[name=send]").on("click", function () {
            let emptyRequestData: sdInquiry[] = [] as sdInquiry[];
            localStorageService.setSdInquiry(currentThreadId, emptyRequestData);
        });

    }
}
