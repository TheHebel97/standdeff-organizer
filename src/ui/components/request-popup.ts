import {requestData} from "../../types/types";
import {
    convertEpochToDate,
    getDataFromLocalStorage,
    storeDataInLocalStorage
} from "../../logic/helpers/helper-functions";

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
                                  
                                    
                                </table>
                                <hr style="margin-top: 15px; margin-bottom: 15px">
                                <textarea class="textAreaKoords" id="textAreaKoords" style="background-color:#EAD5AA;" ></textarea>
                                <input type="button" value="Hinzufügen" class="addBunkerAnfrage btn" style="">
                              </div>
                            </div>
                        </div>
                        <div class='fader'></div>
                    </div>
    `
    $('#ds_body')[0].insertAdjacentHTML('beforeend', initPopopBox)
    $("#textAreaKoords").on("focusout", function () {
        const input = getFilteredInput(String($("#textAreaKoords").val()) || "");
        console.log(input);
        addNewRequestsToArray(input);
        renderTableRows();
    });
    renderTableRows();


}


function renderTableRows(): void {
    $(".requestContent").empty();
    let requestDataArray: requestData[] = getDataFromLocalStorage<requestData[]>('requestData');
    let returnHtml: string = `<tr style='margin=2px;'><th style="padding-left: 10px; padding-right: 10px">Koordinate</th>
                                    <th style="padding-left: 10px; padding-right: 10px">Pakete</th>
                                    <th style="padding-left: 10px; padding-right: 10px">Spieler <span style="font-size: 0.8em;">(optional)</span></th>
                                    <th style="padding-left: 10px; padding-right: 10px">Anmerkung <span style="font-size: 0.8em;">(optional)</span></th>
                                    <th style="padding-left: 10px; padding-right: 10px">ab <span style="font-size: 0.8em;">(optional)</span></th>
                                    <th style="padding-left: 10px; padding-right: 10px">bis <span style="font-size: 0.8em;">(optional)</span></th>
                                    <th style="padding-left: 10px; padding-right: 10px">Löschen</th></tr>`;
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
        } else {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="amountInput${index}" value="">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.playerName) {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="playerNameInput${index}" value="${requestRow.playerName}">`;
        } else {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="playerNameInput${index}" value="">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.comment) {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="commentInput${index}" value="${requestRow.comment}">`;
        } else {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="commentInput${index}" value="">`;
        }

        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.dateFrom) {
            let dateFrom = convertEpochToDate(requestRow.dateFrom);
            returnHtml += `<input type="date" style="background-color:#EAD5AA; border: none;" id="dateFromInput${index}" value="${dateFrom}">`;
        } else {
            returnHtml += `<input type="date" style="background-color:#EAD5AA; border: none;" id="dateFromInput${index}" value="">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.dateUntil) {
            let dateUntil = convertEpochToDate(requestRow.dateUntil);
            returnHtml += `<input type="date" style="background-color:#EAD5AA; border: none;" id="dateUntilInput${index}" value="${dateUntil}">`;
        } else {
            returnHtml += `<input type="date" style="background-color:#EAD5AA; border: none;" id="dateUntilInput${index}" value="">`;
        }
        returnHtml += "</td></tr>";
    })


    $(".requestContent").append(returnHtml);
}


function getFilteredInput(input: string) {
    console.log("getFilteredInput");
    const coordsPattern = /^\d{3}\|\d{3}$/;
    let inputArray: string[] = input.split("\n");
    let resultArray: string[] = [];
    console.log(inputArray);
    inputArray.forEach((line, index) => {
        if(coordsPattern.test(line)) {
            console.log("line is valid");
            resultArray.push(line);
        }
    });
$("#textAreaKoords").val("");
    return resultArray;
}

function addNewRequestsToArray(input: string[]) {
    let requestDataArray: requestData[] = getDataFromLocalStorage<requestData[]>('requestData');
    console.log(requestDataArray);
    input.forEach((line) => {
        let [coords, amount, ...optionalData] = line.split(' ', 3);
        let request: requestData = {
            coords: coords,
            amount: Number(amount),
            playerName: optionalData[1] || undefined,
            comment: optionalData[2] || undefined,
            dateFrom: Number(optionalData[3]) || undefined,
            dateUntil: Number(optionalData[4]) || undefined
        };
        requestDataArray.push(request);
    });
    console.log(requestDataArray);
    storeDataInLocalStorage(requestDataArray, 'requestData');

}



