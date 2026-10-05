import {registerSdThread} from "../../helpers/thread-registration";
import {Log} from "../../helpers/logging-helper";
import {ADD_THREAD_ICON_DATA_URI} from "../ui-assets";

const log = Log.scope("options-sd-thread");

export function addSdOptions(currentThreadId: string | null, forumId: string | null, onRegistered?: () => void) {
    log.info("thread id is not in thread ids");
    const addThreadELem = `<img alt="Als SD-Tabelle speichern" title="Als SD-Tabelle speichern" class="addThread" style="cursor: pointer" src="${ADD_THREAD_ICON_DATA_URI}"/>`;

    $(".thread_answer").parent().parent().append(addThreadELem);
    $(".addThread").on("click", function () {
        if (registerSdThread(currentThreadId, forumId)) {
            $(".addThread").remove();
            $("#tooltip").hide();
            $("#dbInfo_popup_box").remove();
            onRegistered?.();
        }

    });
    $(".addThread").on("mousemove", function (event) {
        let x: number = event.clientX;
        let y: number = event.clientY;

        $("#tooltip").css({
            "top": `${y + 15}px`,
            "left": `${x + 12}px`,
            "right": "auto",
            "display": "",
        }).addClass("tooltip-style");
        $("#tooltip > h3").text("SD Tabelle hinzufuegen");
    });
    $(".addThread").on("mouseout", function () {
        $("#tooltip").css({
            "display": "none",
        });
    });
}
