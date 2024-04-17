import {requestData} from "../../types/types";
import {
    convertEpochToDate,
    getDataFromLocalStorage,
    storeDataInLocalStorage
} from "../../logic/helpers/helper-functions";
import {convertRequestArrayToMessageString} from "../../logic/helpers/table-helper";

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

    $(".addBunkerAnfrage").on("click", function () {
        const result = convertRequestArrayToMessageString(getDataFromLocalStorage<requestData[]>('requestData'));
        $("#message").val(result);
        //close popup
        $("#dbInfo_popup_box").remove();
    });

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
        Object.values(requestRow).forEach((value) => {
            if (value === undefined) {
                console.log("value is undefined");
            }
        });
        returnHtml += `<tr style='margin=2px;'><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.coords) {
            returnHtml += `<span style="font-size: 1.2em; font-weight: bold;">${requestRow.coords}</span>`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.amount) {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="amountInput${index}" class="amountInput" value="${requestRow.amount}">`;
        } else {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="amountInput${index}" class="amountInput" value="">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.playerName) {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="playerNameInput${index}" class="playerNameInput" value="${requestRow.playerName}">`;
        } else {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="playerNameInput${index}" class="playerNameInput" value="">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.comment) {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="commentInput${index}" class="commentInput" value="${requestRow.comment}">`;
        } else {
            returnHtml += `<input type="text" style="background-color:#EAD5AA; border: none;" id="commentInput${index}" class="commentInput" value="">`;
        }

        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.dateFrom) {
            let dateFrom = convertEpochToDate(requestRow.dateFrom);
            returnHtml += `<input type="date" style="background-color:#EAD5AA; border: none;" id="dateFromInput${index}" class="dateFromInput" value="${dateFrom}">`;
        } else {
            returnHtml += `<input type="date" style="background-color:#EAD5AA; border: none;" id="dateFromInput${index}" class="dateFromInput" value="">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        if (requestRow.dateUntil) {
            let dateUntil = convertEpochToDate(requestRow.dateUntil);
            returnHtml += `<input type="date" style="background-color:#EAD5AA; border: none;" id="dateUntilInput${index}" class="dateUntilInput" value="${dateUntil}">`;
        } else {
            returnHtml += `<input type="date" style="background-color:#EAD5AA; border: none;" id="dateUntilInput${index}" class="dateUntilInput" value="">`;
        }
        returnHtml += `</td><td style="padding-left: 10px; padding-right: 10px">`
        returnHtml += `<button style="background: url(https://dsde.innogamescdn.com/asset/c045337f/graphic/delete.png); width: 20px; height: 20px;  border: none" class="deleteRequest" id="deleteRequest${index}"></button>`;
        returnHtml += "</td></tr>";
    })
    $(".requestContent").append(returnHtml);

    $(".deleteRequest").on("click", function () {
        let requestDataArray: requestData[] = getDataFromLocalStorage<requestData[]>('requestData');
        let coords = $(this).closest('tr').children('td:first').text();
        let index = requestDataArray.findIndex(request => request.coords === coords);
        if (index !== -1) {
            requestDataArray.splice(index, 1);
            storeDataInLocalStorage(requestDataArray, 'requestData');
            renderTableRows();
        }
    });

    $(".amountInput").on("click", function () {
        $(this).val("");
    });

    $(".playerNameInput").on("click", function () {
        $(this).val("");
    });

    $(".commentInput").on("click", function () {
        $(this).val("");
    });

    $(".amountInput").on("focusout", function () {
        let requestDataArray: requestData[] = getDataFromLocalStorage<requestData[]>('requestData');
        let coords = $(this).closest('tr').children('td:first').text();
        let index = requestDataArray.findIndex(request => request.coords === coords);
        if (index !== -1) {
            requestDataArray[index].amount = Number($(this).val());
            storeDataInLocalStorage(requestDataArray, 'requestData');
        }
        // Füllen Sie alle anderen leeren Textboxen mit dem Wert
        let value = String($(this).val());
        $(".amountInput").each(function() {
            if ($(this).val() === "") {
                $(this).val(value);
                let coords = $(this).closest('tr').children('td:first').text();
                let index = requestDataArray.findIndex(request => request.coords === coords);
                if (index !== -1) {
                    requestDataArray[index].amount = Number(value);
                    storeDataInLocalStorage(requestDataArray, 'requestData');
                }
            }
        });
    });

    $(".playerNameInput").on("focusout", function () {
        let requestDataArray: requestData[] = getDataFromLocalStorage<requestData[]>('requestData');
        let coords = $(this).closest('tr').children('td:first').text();
        let index = requestDataArray.findIndex(request => request.coords === coords);
        if (index !== -1) {
            requestDataArray[index].playerName = String($(this).val());
            storeDataInLocalStorage(requestDataArray, 'requestData');
        }
        // Füllen Sie alle anderen leeren Textboxen mit dem Wert
        let value = String($(this).val());
        $(".playerNameInput").each(function() {
            if ($(this).val() === "") {
                $(this).val(value);
                let coords = $(this).closest('tr').children('td:first').text();
                let index = requestDataArray.findIndex(request => request.coords === coords);
                if (index !== -1) {
                    requestDataArray[index].playerName = String(value);
                    storeDataInLocalStorage(requestDataArray, 'requestData');
                }
            }
        });
    });

    $(".commentInput").on("focusout", function () {
        let requestDataArray: requestData[] = getDataFromLocalStorage<requestData[]>('requestData');
        let coords = $(this).closest('tr').children('td:first').text();
        let index = requestDataArray.findIndex(request => request.coords === coords);
        if (index !== -1) {
            requestDataArray[index].comment = String($(this).val());
            storeDataInLocalStorage(requestDataArray, 'requestData');
        }
        // Füllen Sie alle anderen leeren Textboxen mit dem Wert
        let value = String($(this).val());
        $(".commentInput").each(function() {
            if ($(this).val() === "") {
                $(this).val(value);
                let coords = $(this).closest('tr').children('td:first').text();
                let index = requestDataArray.findIndex(request => request.coords === coords);
                if (index !== -1) {
                    requestDataArray[index].comment = String(value);
                    storeDataInLocalStorage(requestDataArray, 'requestData');
                }
            }
        });
    });

    $(".dateFromInput").on("focusout", function () {


    });

    $(".dateUntilInput").on("focusout", function () {

    });

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



