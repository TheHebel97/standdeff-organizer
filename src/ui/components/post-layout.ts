import {createPendingOperation} from "../../helpers/pending-operation";
import {convertRequestArrayToMessageString} from "../../helpers/table-domain";
import {isUserForumMod} from "../../helpers/tw-helper";
import {showRequestPopup} from "./request-popup";
import {syncRequestBunkerBadge} from "./request-button-badge";

import {updateData, sdInquiry} from "../../types/types";
import {LocalStorageHelper} from "../../helpers/local-storage-helper";
import {Log} from "../../helpers/logging-helper";

const log = Log.scope("post-layout");
const PACKAGE_BADGE_STYLE_ID = "packageStatusNotificationBadgeStyle";

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
    syncRequestBunkerBadge(currentThreadId);
    if (finishedRequests > 0) {
        $("#addBearbeitung").after('<span class="notification-badge" id="notificationBadge">!</span>');
        if (!document.getElementById(PACKAGE_BADGE_STYLE_ID)) {
            const style = document.createElement("style");
            style.id = PACKAGE_BADGE_STYLE_ID;
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
    }

    log.info("Binding thread reply helpers", {
        finishedRequests
    });

    $("#requestBunker").on("click", function () {
        showRequestPopup(currentThreadId);
        log.info("Opened bunker request popup");
    });

    $("#addBearbeitung").on("click", function () {

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

    $('#message').closest('form')[0]?.addEventListener('submit', function(event) {
        const message = String($('#message').val() ?? '').trim();
        const inquiries = localStorageService.getSdInquiry(currentThreadId);
        const packages = Array.from(localStorageService.getPackagesSent(currentThreadId));
        const packageText = packages.map(([id,amount]) => `${id} ${amount}`).join('\n');
        const requestText = convertRequestArrayToMessageString(inquiries).trim();
        if (message !== packageText.trim() && message !== requestText) return;
        if (!message) return;
        try {
            createPendingOperation({kind:'forum', threadId:currentThreadId, message,
                knownPostIds:$('.post > a[name]').map((_,a)=>String(a.getAttribute('name'))).get(),
                inquiries:message === requestText ? inquiries : [], packages:message === packageText.trim() ? packages : []});
        } catch {
            event.preventDefault();
            event.stopImmediatePropagation();
            UI.ErrorMessage('Beitragsentwurf konnte nicht gespeichert werden. Bitte Browserspeicher prüfen.',5000);
        }
    }, true);
}
