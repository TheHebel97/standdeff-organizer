import {LocalStorageService} from "../../logic/local-storage-service";
import {packages, updateData, rowSdTable, sdInquiry, sdState, sdTableState} from "../../types/types";
import {calculateSdTableState, parseEditSdTableData} from "../../logic/helpers/table-helper";

export function editSdPost(updateData: updateData) {
    console.log("Sd tabellen bearbeitenmodus")
    //only sf mod can edit sd table
    const localStorageService = LocalStorageService.getInstance();
    const urlParams = new URLSearchParams(window.location.search);
    const currentThreadId = urlParams.get("thread_id") || "";

    //ui
    const sdPostId = localStorageService.getSdPostId(currentThreadId);
    const updateBtn = `<a class="updateSDTabelle" style="cursor: pointer">Update SD Tabelle</a>`
    $("a[name='" + sdPostId + "']").parent().find(".postheader_right").append(updateBtn);

    $(".updateSDTabelle").on("click", function () {
        updateSdTable(updateData)
    })


}


function updateSdTable(updateData: updateData) { // hier wird mir kinda schlecht
    const tablePattern = /\[table]([\s\S]*)\[\/table]/;
    const cachePattern = /\[spoiler=base64cache]([\s\S]*?)\[\/spoiler]/;
    const rawSdPostText = String($("#message").val());
    const table = rawSdPostText.match(tablePattern);
    const cache = rawSdPostText.match(cachePattern);

    if (table === null || cache === null) {
        console.error("Table or Cache not found")
        return;
    }

    let sdState: sdState = parseEditSdTableData(table[1], cache[0])
    console.log("sdState")
    console.log(sdState)
    console.log("parsedPosts")
    console.log(updateData)

    calculateSdTableState(updateData, sdState)
    //mit tabelle verrechnen
    //base64 code updaten
    //hier drin alles flüchtig speichern

    //1. Parsen des Textes der sd tabelle
}


