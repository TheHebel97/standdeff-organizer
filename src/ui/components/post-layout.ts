import {isUserForumMod} from "../../helpers/tw-helper";
import {showRequestPopup} from "./request-popup";

import {updateData, sdInquiry} from "../../types/types";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {Log} from "../../helpers/logging-helper";

const log = Log.scope("post-layout");

export function postLayout(currentThreadId: string, isAnswerMode: boolean, updateData: updateData) {
    log.state("Preparing post layout", {
        currentThreadId,
        isAnswerMode,
        parsedPostCount: updateData.size
    });

    if (!isAnswerMode) {
        return;
    }

    const localStorageService = LocalStorageHelper.getInstance();

    if (!isUserForumMod()) {
        log.info("User is not forum mod; locking textarea by default");
        $("#message").prop("readonly", true);
        let element = $("#message");
        const styledElem = `<div class="hideUserInput" style="position: relative">
                                                          <div id="messageCover" style="position: absolute; width: 614px; height: 220px; top:-16%; left: 0; background-color: gray; opacity: 0.5"></div>
                                                      </div>`;
        $("#message").parent().append(styledElem);
        $(".hideUserInput").append(element);
        $(".hideUserInput").on("dblclick", function () {
            $("#messageCover").remove();
            $("#message").prop("readonly", false);
        });
    }

    const finishedRequests = localStorageService.getPackagesSent(currentThreadId).size;
    const postLayoutHtml = `
<input class="btn" type="button" value="Bunker anfragen" id="requestBunker">
<input class="btn" type="button" value="Bearbeitung eintragen" id="addBearbeitung">`;
    $("input[name=preview]").remove();
    $("input[name=send]").parent().prepend(postLayoutHtml);
    if (finishedRequests > 0) {
        $("#addBearbeitung").after('<span class="notification-badge" id="notificationBadge">!</span>');
        const style = document.createElement("style");
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

    log.info("Binding thread reply helpers", {
        finishedRequests
    });

    $("#requestBunker").on("click", function () {
        showRequestPopup(currentThreadId);
        log.info("Opened bunker request popup");
    });

    $("#addBearbeitung").on("click", function () {
        $("input[name=send]").on("click", function () {
            localStorageService.setPackagesSent(currentThreadId, new Map());
        });
        $("#notificationBadge").remove();

        const packagesSent = localStorageService.getPackagesSent(currentThreadId);
        let res = "";
        packagesSent.forEach((value, key) => {
            res += `${key} ${value}\n`;
        });

        $("#message").val(res);
        log.info("Inserted package status lines into reply textarea", {
            lineCount: packagesSent.size
        });
    });

    $("input[name=send]").on("click", function () {
        let emptyRequestData: sdInquiry[] = [] as sdInquiry[];
        localStorageService.setSdInquiry(currentThreadId, emptyRequestData);
    });
}
