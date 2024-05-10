import {LocalStorageService} from "../../logic/local-storage-service";
import {packages, parseReturn, rowSdTable, sdInquiry} from "../../types/types";

export function editSdPost(parsedPosts: parseReturn) {
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
        updateSdTable(parsedPosts)
    })




}


function updateSdTable(parsedPosts: parseReturn) {
    console.log("update sd table")
    //ablauf:
    //parsen des textes der sd tabelle
    //daten davon erheben
    //base64 code der geupdateten posts auslesen
    //posts entsprechend einfärben
    //parsen der restlichen posts
    //erstellen der datentypen für neueBunker und bearbeitungen // auch im großen objekt
    //mit tabelle verrechnen
    //base64 code updaten
    //hier drin alles flüchtig speichern

    //1. Parsen des Textes der sd tabelle
}


