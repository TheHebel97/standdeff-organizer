import {addThreadIdToLocalStorage} from "../../helpers/helper-functions";
import {Log} from "../../helpers/logging-helper";
import {ADD_THREAD_ICON_DATA_URI} from "../ui-assets";

const log = Log.scope("options-sd-thread");

export function addSdOptions(currentThreadId: string | null, forumId: string | null) {
    log.info("thread id is not in thread ids");
    const addThreadELem = `<img class="addThread" style="cursor: pointer" src="${ADD_THREAD_ICON_DATA_URI}"/>`;

    $(".thread_answer").parent().parent().append(addThreadELem);
    $(".addThread").on("click", function () {
        const edit_post_id = $(".post > a").attr("name");
        const thread_name: string | null = $(".clearfix > table").first().find("h2").text();
        const forum_name: string | null = $(".forum-container").find(".selected").text().trim();
        if (edit_post_id !== undefined) {
            addThreadIdToLocalStorage(currentThreadId, edit_post_id, thread_name, forum_name, forumId);
            $(".addThread").remove();
            $("#tooltip").css({
                "display": "none",
            });
            const sdTableTitle = `<span style="color: #002bff; font-size: x-small"> (SD Tabelle)</span>`;
            $(".clearfix > table").first().find("h2").append(sdTableTitle);
        } else {
            log.error("edit_post_id is undefined");
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
