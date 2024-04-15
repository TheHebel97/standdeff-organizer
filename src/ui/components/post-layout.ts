import {isUserForumMod} from "../../logic/helpers/tw-helper";
import {showRequestPopup} from "./request-popup";
import {requestData} from "../../types/types";
import {convertMessageRequestStringToRequestArray} from "../../logic/helpers/table-helper";

export function postLayout() {
    console.log("post layout");
    let pastRequests: [requestData];
    const urlParams = new URLSearchParams(window.location.search);

    if (!isUserForumMod()) {
        console.log("user is not forum mod and text area is present")
        $("#message").prop("readonly", true)
        let element = $("#message")
        const styledElem = `<div class="TEST" style="position: relative">
                                                          <div id="messageCover" style="position: absolute; width: 614px; height: 220px; top:-16%; left: 0%; background-color: gray; opacity: 0.5"></div>
                                                      </div>`
        $("#message").parent().append(styledElem)
        $(".TEST").append(element)
        $(".TEST").on("dblclick", function () {
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
        const editText: String = String($("#message").val());
        pastRequests = convertMessageRequestStringToRequestArray(editText)
    }
    console.log("neuer post")


    $("#requestBunker").on("click", function () {
        showRequestPopup(pastRequests);
    })
    $("#addBearbeitung").on("click", function () {
        console.log("bearbeitung eintragen")
    })

}
