import {requestData} from "../../types/types";
import {convertEpochToDate, getDataFromLocalStorage} from "../../logic/helpers/helper-functions";

export function showRequestPopup() {
    console.log("show request popup");
    // requestData-Objekt aus dem LocalStorage abrufen

    const initPopopBox = `
                    <div class="popup_box_container" id="dbInfo_popup_box">
                        <div class='popup_box show'>
                            <a class='popup_box_close tooltip-delayed' href='#' onclick='$(\"#dbInfo_popup_box\").remove()'>&nbsp</a>
                            <div class='popup_box_content'>
                              <div class='center'>
                                <h2>Bunker Anfragen</h2>
                                <table class="requestContent">
                                  <tr style='margin=2px;'>
                                    <th style="padding-left: 10px; padding-right: 10px">Koordinate</th>
                                    <th style="padding-left: 10px; padding-right: 10px">Pakete</th>
                                    <th style="padding-left: 10px; padding-right: 10px">Spieler <span style="font-size: 0.8em;">(optional)</span></th>
                                    <th style="padding-left: 10px; padding-right: 10px">Anmerkung <span style="font-size: 0.8em;">(optional)</span></th>
                                    <th style="padding-left: 10px; padding-right: 10px">ab <span style="font-size: 0.8em;">(optional)</span></th>
                                    <th style="padding-left: 10px; padding-right: 10px">bis <span style="font-size: 0.8em;">(optional)</span></th>
                                    <th style="padding-left: 10px; padding-right: 10px">Löschen</th></tr>
                                </table>
                                <hr style="margin-top: 15px; margin-bottom: 15px">
                                <textarea class="textAreaKoords" style="background-color:#EAD5AA;" ></textarea>
                                <input type="button" value="Hinzufügen" class="addBunkerAnfrage btn" style="">
                              </div>
                            </div>
                        </div>
                        <div class='fader'></div>
                    </div>
    `
    $('#ds_body')[0].insertAdjacentHTML('beforeend', initPopopBox)
    renderTableRows();


}


function renderTableRows(): void {

    let requestDataArray: requestData[] = getDataFromLocalStorage<requestData[]>('requestData');
    let returnHtml: string = "";
    requestDataArray.forEach((requestRow, index) => {
        console.log(Object.keys(requestRow).length)
        Object.values(requestRow).forEach((value) => {
            if (value === undefined) {
                console.log("value is undefined");
            }
            console.log(value);
        });
        console.log(requestRow);
        returnHtml += `<tr style='margin=2px;'><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.coords) {
            returnHtml += `<span style="font-size: 1.2em; font-weight: bold;">${requestRow.coords}</span>`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.amount) {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="amountInput${index}" value="${requestRow.amount}">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.playerName) {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="playerNameInput${index}" value="${requestRow.playerName}">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.comment) {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="commentInput${index}" value="${requestRow.comment}">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.dateFrom) {
            let dateFrom = convertEpochToDate(requestRow.dateFrom);
            returnHtml += `<input type="date" style="background-color:#EAD5AA; border: none;" id="dateFromInput${index}" value="${dateFrom}">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.dateUntil) {
            let dateUntil = convertEpochToDate(requestRow.dateUntil);
            returnHtml += `<input type="date" style="background-color:#EAD5AA; border: none;" id="dateUntilInput${index}" value="${dateUntil}">`;
        }
        returnHtml += "</td></tr>";
    })


    $(".requestContent").append(returnHtml);
}




