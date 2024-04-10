import {isUserForumMod} from "../../logic/helpers/tw-helper";

export function editPost(){
    console.log("edit post");

    if ($("#message").length) { //wenn textarea vorhanden

    }

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
}
