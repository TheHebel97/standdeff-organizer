import {isUserForumMod} from "../../logic/helpers/tw-helper";
import {showRequestPopup} from "./request-popup";
import {convertMessageRequestStringToRequestArray} from "../../logic/helpers/table-helper";
import {parseReturn, sdInquiry} from "../../types/types";
import {LocalStorageService} from "../../logic/local-storage-service";

export function postLayout(parsedPosts: parseReturn) {
    console.log("parsed posts in view thread")
    console.log(parsedPosts) //parsed posts in view thread // für die darstellung der sd tabelle
    console.log("post layout");
    const localStorageService = LocalStorageService.getInstance();
    const urlParams = new URLSearchParams(window.location.search);
    const currentThreadId = urlParams.get("thread_id")||"";

    if (!isUserForumMod()) {
        console.log("user is not forum mod and text area is present")
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

    const postLayout = `
<input class="btn" type="button" value="Bunker anfragen" id="requestBunker">
<input class="btn" type="button" value="Bearbeitung eintragen" id="addBearbeitung">`
    $("input[name=preview]").remove()
    $("input[name=send]").parent().prepend(postLayout)


    if (!urlParams.has("answer")) { // neuer post

        console.log("bearbeiten eines posts, der nicht die sd tabelle ist")
        let editText: String = String($("#message").val());
        let pastRequests: sdInquiry[] = localStorageService.getSdInquiry(currentThreadId) || [] as sdInquiry[];
        let newRequests: sdInquiry[] = convertMessageRequestStringToRequestArray(editText) || [] as sdInquiry[];

// Merge pastRequests and newRequests
        pastRequests = [...pastRequests, ...newRequests];

// Remove duplicates based on coords
        let uniqueRequests: sdInquiry[] = [];
        let map = new Map();

        for (let request of pastRequests) {
            if (!map.has(request.coords)) {
                map.set(request.coords, true);
                uniqueRequests.push(request);
            }
        }
        localStorageService.setSdInquiry(currentThreadId, uniqueRequests);
    }
    console.log("neuer post")


    $("#requestBunker").on("click", function () {
        showRequestPopup();
        console.log("past requests");
    })
    $("#addBearbeitung").on("click", function () {
        console.log("bearbeitung eintragen")
    })
    $("input[name=send]").on("click", function () {
        let emptyRequestData: sdInquiry[] = [] as sdInquiry[];
        localStorageService.setSdInquiry(currentThreadId, emptyRequestData);
    });

}
